## React + FastAPI 웹캠 기반 이미지 캡처 & 히스토리 관리 서비스 개발 가이드 (Conda 환경 & 장기적 관점)

이 문서는 React 프론트엔드를 사용하여 웹캠에 접근하여 사진을 캡처하고, 캡처한 이미지를 FastAPI 백엔드로 전송하여 유저별 히스토리를 관리하는 웹 서비스 개발 가이드입니다. Conda 가상 환경을 사용하여 프로젝트 환경을 관리하고, 회원가입/로그인 기능을 구현하여 사용자를 인증합니다. 서버는 JSON 파일을 통해 관리하며, 실제 코드 예시는 제공되지만, 장기적인 관점에서 추가적인 확장 및 보안 강화를 위한 고려 사항을 함께 제시합니다.

### 1. 개발 환경 설정 (Conda)

1.  **Conda 설치:** Anaconda 또는 Miniconda를 설치합니다.

2.  **가상 환경 생성:** 프로젝트 전용 가상 환경을 생성합니다.

    ```bash
    conda create -n myenv python=3.9  # Python 버전 지정 (선택 사항)
    conda activate myenv
    ```

3.  **프론트엔드 (React) 의존성 설치:** (별도의 터미널 창에서 진행)

    ```bash
    npx create-react-app frontend --template typescript
    cd frontend
    npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
    ```

4.  **백엔드 (FastAPI) 의존성 설치:**

    ```bash
    pip install fastapi uvicorn python-multipart Pillow
    ```

### 2. 프로젝트 구조 (수정 없음)

```
├── frontend/          # React 프론트엔드 코드
│   ├── src/
│   │   ├── components/
│   │   │   ├── WebcamCapture.tsx  # 웹캠 접근 및 캡처 컴포넌트
│   │   │   ├── ImageDisplay.tsx   # 이미지 표시 컴포넌트
│   │   │   ├── Login.tsx          # 로그인 컴포넌트
│   │   │   ├── Signup.tsx         # 회원가입 컴포넌트
│   │   ├── App.tsx              # 메인 컴포넌트
│   │   ├── authContext.tsx        # 인증 컨텍스트
│   └── ...
├── backend/           # FastAPI 백엔드 코드
│   ├── main.py          # 메인 애플리케이션 파일
│   ├── users.json       # 사용자 정보 저장 파일
│   ├── image_history/    # 사용자별 이미지 히스토리 저장 디렉토리
│   └── utils.py         # 유틸리티 함수 (파일 저장, 사용자 관리 등)
```

### 3. 프론트엔드 (React) 개발 (코드 수정 없음)

다음은 프론트엔드 개발에 필요한 컴포넌트 코드입니다. 각 코드 블록은 구현에 필요한 핵심 내용을 담고 있으며, 세부적인 스타일링 및 추가 기능은 필요에 따라 자유롭게 수정할 수 있습니다.

#### 3.1. authContext.tsx (인증 컨텍스트)

```typescript
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
    user: string | null;
    login: (username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<string | null>(localStorage.getItem('username') || null);

    const login = (username: string) => {
        setUser(username);
        localStorage.setItem('username', username);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('username');
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
};
```

#### 3.2. Login 컴포넌트 (src/components/Login.tsx)

```typescript
import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login(username);
                navigate('/');
            } else {
                setError(data.detail || 'Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
```

#### 3.3. Signup 컴포넌트 (src/components/Signup.tsx)

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login');
            } else {
                setError(data.detail || 'Signup failed');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Signup</button>
            </form>
        </div>
    );
};

export default Signup;
```

#### 3.4. WebcamCapture 컴포넌트 (src/components/WebcamCapture.tsx)

```typescript
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../authContext';

const WebcamCapture: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const setupWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
                setMessage('웹캠 접근에 실패했습니다.');
            }
        };

        setupWebcam();
    }, []);

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current || !user) {
            setMessage('웹캠이 준비되지 않았거나 로그인되지 않았습니다.');
            return;
        }

        setLoading(true);
        setMessage('');

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageUrl = canvas.toDataURL('image/jpeg'); // 또는 image/png

        try {
            const response = await axios.post('http://localhost:8000/upload', {
                image: imageUrl,
                username: user,
            });

            if (response.status === 200) {
                setImageUrl(response.data.imageUrl);
                setMessage('이미지 업로드 성공!');
            } else {
                setMessage('이미지 업로드 실패.');
            }
        } catch (error: any) {
            setMessage(`이미지 업로드 실패: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <video ref={videoRef} autoPlay muted style={{ maxWidth: '500px' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <button onClick={captureImage} disabled={loading}>
                {loading ? '캡처 중...' : '이미지 캡처'}
            </button>
            {message && <p>{message}</p>}
            {imageUrl && <img src={imageUrl} alt="Captured" style={{ maxWidth: '300px' }} />}
        </div>
    );
};

export default WebcamCapture;
```

#### 3.5. ImageDisplay 컴포넌트 (src/components/ImageDisplay.tsx)

```typescript
import React from 'react';

interface ImageDisplayProps {
    imageUrl: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl }) => {
    return (
        <div>
            {imageUrl && <img src={imageUrl} alt="Captured" style={{ maxWidth: '300px' }} />}
        </div>
    );
};

export default ImageDisplay;
```

#### 3.6. App 컴포넌트 (src/App.tsx)

```typescript
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import WebcamCapture from './components/WebcamCapture';
import { AuthProvider, useAuth } from './authContext';

function App() {
    const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
        const { user } = useAuth();
        return user ? <>{children}</> : <Navigate to="/login" />;
    };

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<PrivateRoute><WebcamCapture /></PrivateRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
```

### 4. 백엔드 (FastAPI) 개발 (코드 수정 없음)

다음은 FastAPI 백엔드 개발에 필요한 코드입니다. 데이터 모델 정의, API 엔드포인트 구현, 데이터베이스 연동 등 백엔드 로직을 구현합니다.

#### 4.1. users.json (사용자 정보 저장 파일)

```json
[
  {
    "username": "testuser",
    "password": "password123"
  }
]
```

#### 4.2. utils.py (유틸리티 함수)

```python
import json
import os
import base64
from PIL import Image
from io import BytesIO

USERS_FILE = "users.json"

def load_users():
    """Load user data from JSON file."""
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_user(user):
    """Save new user data to JSON file."""
    users = load_users()
    users.append(user)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

def create_image_directory(username):
  image_dir = os.path.join("image_history", username)
  if not os.path.exists(image_dir):
    os.makedirs(image_dir)
  return image_dir

def save_image(username: str, image_data: str):
    """Saves a base64 encoded image to the user's directory."""
    try:
        image_dir = create_image_directory(username)
        image = Image.open(BytesIO(base64.b64decode(image_data.split(',')[1]))) # Remove header and decode

        image_id = str(len(os.listdir(image_dir)) + 1).zfill(4) # Zero-pad the image ID
        file_path = os.path.join(image_dir, f"{image_id}.jpeg")

        image.save(file_path, "JPEG")

        return file_path
    except Exception as e:
        print(f"Error saving image: {e}")
        return None
```

#### 4.3. main.py (FastAPI 애플리케이션)

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from fastapi.responses import FileResponse
from utils import load_users, save_user, save_image
import os

app = FastAPI()

# CORS 설정 (프론트엔드 도메인을 허용해야 함)
origins = [
    "http://localhost:3000",  # 프론트엔드 개발 서버 주소
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
    """Registers a new user."""
    users = load_users()
    if any(u['username'] == user.username for u in users):
        raise HTTPException(status_code=400, detail="Username already registered")

    user_dict = user.dict()
    save_user(user_dict)  # type: ignore
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(user: User):
    """Logs in an existing user."""
    users = load_users()
    valid_user = next((u for u in users if u['username'] == user.username and u['password'] == user.password), None)

    if valid_user:
        return {"message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

class UploadImageRequest(BaseModel):
    image: str
    username: str

@app.post("/upload")
async def upload_image(request: UploadImageRequest):
    """Uploads an image for a specific user."""
    try:
        image_path = save_image(request.username, request.image)

        if image_path:
            return {"imageUrl": f"http://localhost:8000/images/{request.username}/{os.path.basename(image_path)}"} # construct public URL
        else:
            raise HTTPException(status_code=500, detail="Failed to save image")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/images/{username}/{image_name}")
async def get_image(username: str, image_name: str):
    """Serves an image from the user's directory."""
    image_path = os.path.join("image_history", username, image_name)
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(image_path)
```

#### 4.5. 서버 실행

```bash
uvicorn main:app --reload
```

### 5. 추가 설명 및 지침 (장기적인 개발 관점)

다음은 앞으로 서비스를 개선하고 확장하는 데 도움이 될 수 있는 추가적인 설명 및 지침입니다.

*   **데이터베이스**: JSON 파일 대신 실제 데이터베이스(PostgreSQL, MongoDB 등)를 사용하는 것을 고려하세요. 데이터베이스를 사용하면 데이터 관리, 검색, 확장이 훨씬 쉬워집니다.
*   **보안**:
    *   **비밀번호 암호화**: 실제 서비스에서는 사용자 비밀번호를 bcrypt, scrypt 등의 강력한 암호화 알고리즘으로 암호화하여 저장해야 합니다.
    *   **JWT (JSON Web Token) 인증**: API 보안을 강화하고 사용자 세션을 관리하기 위해 JWT 기반 인증 시스템을 구현하는 것이 좋습니다.
    *   **입력 유효성 검사**: SQL Injection, XSS 등의 공격을 방어하기 위해 사용자 입력을 철저히 검증해야 합니다.
*   **테스트**: 단위 테스트, 통합 테스트를 작성하여 코드의 안정성을 확보하고 잠재적인 버그를 사전에 발견해야 합니다.
*   **API 문서화**: Swagger 또는 Redoc과 같은 도구를 사용하여 API 문서를 자동으로 생성하고 관리하면 개발 생산성을 향상시킬 수 있습니다.
*   **로깅**: 서비스 운영 중 발생하는 오류 및 예외 상황을 기록하기 위해 로깅 시스템을 구축하는 것이 중요합니다.
*   **성능 모니터링**: 서비스의 성능을 지속적으로 모니터링하고, 병목 지점을 찾아 최적화해야 합니다.
*   **클라우드 배포**: Docker, Kubernetes, AWS, GCP, Azure 등을 사용하여 서비스를 클라우드 환경에 배포하고 확장성을 확보하는 것을 고려해볼 수 있습니다.
*   **이미지 처리**: 업로드된 이미지에 대해 리사이징, 워터마크 추가, 메타데이터 추출 등 다양한 이미지 처리 기능을 추가할 수 있습니다.
*   **AI 모델 연동**: 얼굴 인식, 객체 탐지 등 AI 모델을 연동하여 이미지 분석 기능을 추가할 수 있습니다.

### 6. 규제 사항
- 5번 추가 설명 및 지침은 개발하지 않고, 참고만 합니다.

이 가이드라인은 React 프론트엔드를 사용하여 웹캠에 접근하여 사진을 캡처하고, 캡처한 이미지를 FastAPI 백엔드로 전송하여 유저별 히스토리를 관리하는 기본적인 웹 서비스 개발 방법을 제공합니다. 이후 위에 제시된 추가적인 기능들을 구현하여 더욱 강력하고 완성도 높은 웹 서비스를 개발할 수 있을 것입니다.