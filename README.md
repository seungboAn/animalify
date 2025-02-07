# Animalify - 웹캠 기반 이미지 캡처 & 히스토리 관리 서비스

이 프로젝트는 Cursor AI의 YOLO 모드를 활용하여 개발된 웹 애플리케이션입니다. React와 FastAPI를 사용하여 웹캠에서 이미지를 캡처하고 사용자별로 이미지 히스토리를 관리할 수 있는 서비스를 구현했습니다.

## 기술 스택

### 프론트엔드
- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- Emotion (스타일링)

### 백엔드
- FastAPI
- Python 3.9
- Pillow (이미지 처리)
- uvicorn (ASGI 서버)

## 주요 기능

1. **사용자 인증**
   - 회원가입
   - 로그인/로그아웃
   - 인증 상태 관리

2. **웹캠 캡처**
   - 실시간 웹캠 스트림 표시
   - 이미지 캡처
   - 캡처된 이미지 미리보기

3. **이미지 관리**
   - 사용자별 이미지 저장
   - 이미지 히스토리 관리
   - 이미지 조회

## 프로젝트 구조

```
animalify/
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/   # React 컴포넌트
│   │   ├── App.tsx      # 메인 앱 컴포넌트
│   │   └── authContext.tsx  # 인증 컨텍스트
│   └── package.json
│
├── backend/           # FastAPI 백엔드
│   ├── main.py          # FastAPI 앱
│   ├── utils.py         # 유틸리티 함수
│   └── image_history/   # 이미지 저장소
│
└── guide.md          # 개발 가이드
```

## 시작하기

### 백엔드 설정
1. Python 가상환경 생성 및 활성화
```bash
conda create -n myenv python=3.9
conda activate myenv
```

2. 의존성 설치
```bash
cd backend
pip install fastapi uvicorn python-multipart Pillow
```

3. 서버 실행
```bash
uvicorn main:app --reload
```

### 프론트엔드 설정
1. 의존성 설치
```bash
cd frontend
npm install
```

2. 개발 서버 실행
```bash
npm start
```

## API 엔드포인트

- `POST /signup` - 새 사용자 등록
- `POST /login` - 사용자 로그인
- `POST /upload` - 이미지 업로드
- `GET /images/{username}/{image_name}` - 이미지 조회

## 개발 과정

이 프로젝트는 Cursor AI의 YOLO 모드를 활용하여 개발되었으며, guide.md에 명시된 요구사항을 기반으로 구현되었습니다. 개발 과정에서 다음과 같은 도구와 기술이 활용되었습니다:

- Cursor IDE의 AI 기능을 활용한 코드 생성
- TypeScript를 활용한 타입 안정성 확보
- Material-UI를 활용한 반응형 디자인
- FastAPI의 비동기 처리 기능

## 보안 고려사항

- 사용자 인증 정보는 클라이언트 측에서 안전하게 관리됩니다
- 이미지 업로드 시 사용자 검증을 수행합니다
- 각 사용자의 이미지는 독립된 디렉토리에 저장됩니다

## 향후 개선 사항

1. 이미지 필터 및 효과 추가
2. 사용자 프로필 관리 기능
3. 이미지 공유 기능
4. 비밀번호 암호화 구현
5. 데이터베이스 연동

## 기여하기

1. 이 저장소를 포크합니다
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.