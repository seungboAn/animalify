from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from fastapi.responses import FileResponse
from utils import load_users, save_user, save_image
import os

app = FastAPI()

# CORS 설정
origins = [
    "http://localhost:3000",  # React 개발 서버
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    username: str
    password: str

@app.post("/signup")
async def signup(user: User):
    """새로운 사용자 등록"""
    users = load_users()
    if any(u['username'] == user.username for u in users):
        raise HTTPException(status_code=400, detail="이미 등록된 사용자명입니다")

    user_dict = user.dict()
    save_user(user_dict)
    return {"message": "사용자 등록이 완료되었습니다"}

@app.post("/login")
async def login(user: User):
    """사용자 로그인"""
    users = load_users()
    valid_user = next(
        (u for u in users if u['username'] == user.username and u['password'] == user.password),
        None
    )

    if valid_user:
        return {"message": "로그인 성공"}
    else:
        raise HTTPException(status_code=401, detail="잘못된 사용자명 또는 비밀번호입니다")

class UploadImageRequest(BaseModel):
    image: str
    username: str

@app.post("/upload")
async def upload_image(request: UploadImageRequest):
    """이미지 업로드"""
    try:
        image_path = save_image(request.username, request.image)

        if image_path:
            return {
                "imageUrl": f"http://localhost:8000/images/{request.username}/{os.path.basename(image_path)}"
            }
        else:
            raise HTTPException(status_code=500, detail="이미지 저장에 실패했습니다")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/images/{username}/{image_name}")
async def get_image(username: str, image_name: str):
    """이미지 조회"""
    image_path = os.path.join("image_history", username, image_name)
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="이미지를 찾을 수 없습니다")

    return FileResponse(image_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 