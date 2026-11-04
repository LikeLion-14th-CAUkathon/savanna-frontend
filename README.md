# 🦁 사바나원정 Frontend

2026 멋쟁이사자처럼 중앙대학교 14기 중커톤 라이온 퀸 팀 프론트엔드 레포지토리

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| UI | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | CSS |
| Linter | Oxlint |
| Routing | React Router |
| HTTP Client | Axios |
| Package Manager | npm |

## 🚀 Getting Started

### 1. Repository Clone

```bash
git clone https://github.com/LikeLion-14th-CAUkathon/savanna-frontend.git
cd savanna-frontend
git switch develop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

기본 개발 서버 주소: http://localhost:5173/

## 🌿 Branch Strategy

- `main`: 안정화 및 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치
- `fix/*`: 버그 수정 브랜치
- `chore/*`: 환경 설정 브랜치

모든 기능 개발은 최신 `develop` 브랜치를 기준으로 진행하며, Issue 생성 후 PR을 통해 병합합니다.

## 📋 Collaboration

- 작업 전 Issue 생성
- 기능별 브랜치 생성
- 커밋 컨벤션 준수
- PR 생성 및 코드 리뷰
- 리뷰 후 `develop`에 Merge