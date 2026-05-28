# Movie Review Frontend

Django API와 연결되는 React 데모 페이지입니다.

## 필요한 것

- Node.js 18 이상 (https://nodejs.org 에서 LTS 버전 설치)
- Django 서버가 `http://localhost:8000`에서 실행 중

## 1단계: Django 서버에 CORS 설정 추가

React가 다른 포트(5173)에서 Django(8000)로 요청을 보내려면 CORS 허용이 필요해요.

Django 프로젝트에서 다음을 진행하세요.

```bash
pip install django-cors-headers
```

`config/settings.py`에 추가:

```python
INSTALLED_APPS = [
    # ... 기존 앱들
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 맨 위쪽에
    'django.middleware.security.SecurityMiddleware',
    # ... 기존 미들웨어들
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
```

저장 후 Django 서버 재시작.

## 2단계: 프론트엔드 설치 및 실행

이 폴더에서:

```bash
npm install
npm run dev
```

브라우저에서 자동으로 열리지 않으면 http://localhost:5173 접속.

## 사용 흐름

1. 회원가입 또는 로그인
2. 메인 화면에서 영화 클릭하여 선택
3. 아래 리뷰 작성 폼에 평점/제목/내용 입력
4. Publish 버튼 클릭
5. 최근 리뷰 섹션에서 작성된 리뷰 확인

## 주의

- 영화 데이터가 없으면 빈 화면이 보입니다. Django admin 또는 API로 영화를 먼저 등록하세요.
- 토큰은 localStorage에 저장됩니다. 브라우저 개발자 도구 Application 탭에서 확인 가능.
