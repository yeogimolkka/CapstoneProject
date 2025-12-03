# GitHub Actions CI/CD 워크플로우

이 프로젝트는 GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 구축했습니다.

## 워크플로우 개요

### 1. CI (Continuous Integration) - `ci.yml`

**트리거:**
- `main`, `develop` 브랜치에 push
- `main`, `develop` 브랜치로의 Pull Request

**작업:**
- **Backend Tests**: Node.js 18.x, 20.x에서 백엔드 테스트 실행
- **Frontend Build**: 프론트엔드 TypeScript 타입 체크 및 프로덕션 빌드
- **Lint Check**: npm audit를 통한 보안 취약점 검사

### 2. CD (Continuous Deployment) - `cd.yml`

**트리거:**
- `develop` 브랜치에 push → **스테이징 환경** 자동 배포
- `main` 브랜치에 push → **프로덕션 환경** 배포
- `v*` 태그 생성 → 프로덕션 배포
- 수동 실행 (workflow_dispatch)

**환경 분리:**
- **스테이징 (Staging)**: `develop` 브랜치 → `https://staging.ygmk.app/`
- **프로덕션 (Production)**: `main` 브랜치 → `https://www.ygmk.app/` (기존 GCP 배포와 분리)

**작업:**
- **Build Docker Image**: 백엔드 Docker 이미지 빌드 및 Docker Hub에 푸시 (태그: `staging-*` / `prod-*`)
- **Deploy Backend**: AWS Lambda (Serverless Framework) 배포
- **Deploy Frontend**: Vercel 배포

### 3. Docker Build - `docker-build.yml`

**트리거:**
- 백엔드 코드 변경 시
- 수동 실행

**작업:**
- Docker 이미지 빌드 및 테스트

## 필요한 GitHub Secrets 설정

다음 Secrets를 GitHub 저장소 설정에서 추가해야 합니다:

### 필수 Secrets

#### CI용
- `SUPABASE_URL`: Supabase 프로젝트 URL (테스트용)
- `SUPABASE_KEY`: Supabase API 키 (테스트용)
- `JWT_SECRET`: JWT 토큰 시크릿 키 (테스트용)

#### CD용 (Docker)
- `DOCKER_USERNAME`: Docker Hub 사용자명
- `DOCKER_PASSWORD`: Docker Hub 비밀번호

#### CD용 (AWS 배포) - 스테이징
- `AWS_ACCESS_KEY_ID_STAGING`: AWS 액세스 키 ID (스테이징)
- `AWS_SECRET_ACCESS_KEY_STAGING`: AWS 시크릿 액세스 키 (스테이징)
- `DATABASE_URL_STAGING`: 스테이징 데이터베이스 URL

#### CD용 (AWS 배포) - 프로덕션
- `AWS_ACCESS_KEY_ID_PROD`: AWS 액세스 키 ID (프로덕션)
- `AWS_SECRET_ACCESS_KEY_PROD`: AWS 시크릿 액세스 키 (프로덕션)
- `DATABASE_URL_PROD`: 프로덕션 데이터베이스 URL

#### CD용 (Vercel 배포) - 스테이징
- `VERCEL_TOKEN`: Vercel API 토큰
- `VERCEL_ORG_ID`: Vercel 조직 ID
- `VERCEL_PROJECT_ID_STAGING`: Vercel 프로젝트 ID (스테이징)
- `VITE_API_URL_STAGING`: 스테이징 프론트엔드 API URL

#### CD용 (Vercel 배포) - 프로덕션
- `VERCEL_PROJECT_ID_PROD`: Vercel 프로젝트 ID (프로덕션)
- `VITE_API_URL_PROD`: 프로덕션 프론트엔드 API URL

#### 선택적
- `SLACK_WEBHOOK_URL`: 배포 알림용 Slack 웹훅 URL

## Secrets 설정 방법

1. GitHub 저장소로 이동
2. **Settings** → **Secrets and variables** → **Actions** 클릭
3. **New repository secret** 클릭
4. 위의 Secrets를 하나씩 추가

## 환경 변수 설정

배포 환경에 따라 다음 환경 변수를 설정할 수 있습니다:

- `DEPLOY_TO_AWS`: AWS 배포 활성화 (`true`/`false`)
- `DEPLOY_TO_VERCEL`: Vercel 배포 활성화 (`true`/`false`)

## 워크플로우 사용법

### 자동 실행
- **CI**: `main` 또는 `develop` 브랜치에 코드를 push하면 자동 실행됩니다.
- **CD 스테이징**: `develop` 브랜치에 push하면 스테이징 환경에 자동 배포됩니다.
- **CD 프로덕션**: `main` 브랜치에 push하면 프로덕션 환경에 배포됩니다.

### 브랜치 전략
```
develop (스테이징) → main (프로덕션)
     ↓                    ↓
staging.ygmk.app    www.ygmk.app
```

### 수동 실행
1. GitHub 저장소의 **Actions** 탭으로 이동
2. 실행할 워크플로우 선택
3. **Run workflow** 버튼 클릭
4. 환경 선택 (production/staging)
5. 실행

## 로컬 테스트

워크플로우를 로컬에서 테스트하려면:

```bash
# 백엔드 테스트
cd my-react-app/backend
npm test

# 프론트엔드 빌드
cd my-react-app/frontend
npm run build

# Docker 빌드
cd my-react-app/backend
docker build -t capstone-backend .
```

## 스테이징 환경 설정

### 도메인 설정
스테이징 환경을 위한 서브도메인을 설정해야 합니다:

1. **DNS 설정**: 도메인 관리자에서 `staging.ygmk.app` 서브도메인 추가
2. **Vercel 설정**: Vercel 대시보드에서 `staging.ygmk.app` 도메인 연결
3. **AWS 설정**: API Gateway 또는 CloudFront에서 스테이징 도메인 연결

### 환경별 Secrets
각 환경(스테이징/프로덕션)에 맞는 Secrets를 별도로 설정해야 합니다:
- 스테이징: `*_STAGING` 접미사
- 프로덕션: `*_PROD` 접미사

## 문제 해결

### 테스트 실패
- 환경 변수가 올바르게 설정되었는지 확인
- 로컬에서 테스트가 통과하는지 확인

### 배포 실패
- Secrets가 올바르게 설정되었는지 확인 (환경별로 분리)
- AWS/Vercel 자격 증명이 유효한지 확인
- 배포 대상 환경의 리소스 상태 확인
- 브랜치가 올바른지 확인 (`develop` = 스테이징, `main` = 프로덕션)

### 스테이징과 프로덕션 충돌
- 각 환경은 독립적인 데이터베이스와 리소스를 사용합니다
- 기존 GCP 프로덕션 배포(`www.ygmk.app`)와는 별도로 운영됩니다

## 추가 정보

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Docker 문서](https://docs.docker.com/)
- [Serverless Framework 문서](https://www.serverless.com/framework/docs)
- [Vercel 문서](https://vercel.com/docs)

