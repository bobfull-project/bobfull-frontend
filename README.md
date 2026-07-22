# 밥풀 프론트엔드

Spring Boot API 테스트와 MVP 시연을 위한 React 클라이언트입니다.

## 시작하기

최초 1회 실행
```bash
npm install
cp .env.example .env.local
npm run dev
```
서버 시작
```bash
npm run dev
```
서버 종료 : ctrl + c

`VITE_USE_MOCK=true`는 브라우저 내 Mock repository를 사용합니다. 백엔드 연동 시 `false`로 변경하고 `VITE_API_BASE_URL`을 지정하세요.

## 구조

- `app`: 앱 초기화, 라우터, 전역 Provider
- `components`: 공통 UI와 레이아웃
- `features`: 도메인별 화면/스키마/서비스
- `lib`: Axios, 공통 유틸리티
- `mocks`: Mock 데이터
- `stores`: 최소 전역 상태
- `types`: API 공통 타입
