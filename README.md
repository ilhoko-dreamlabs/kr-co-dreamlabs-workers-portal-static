# DreamLabs Workers Portal Static

`https://portal.workers.dreamlabs.co.kr/`에 게시되는 DreamLabs Worker 생태계의 공개
정적 안내 허브다. 역할별 Worker, WorkerOps, Worker Host, Worker Gateway, Worker Meet,
Worker Manual, DreamLabs Assets와 연결 업무 시스템을 설명하고 올바른 대표 주소로
이동시킨다.

## Current state

- repository: `ilhoko-dreamlabs/kr-co-dreamlabs-workers-portal-static`
- default branch: `main`
- hosting: GitHub Pages Actions workflow
- custom domain: `https://portal.workers.dreamlabs.co.kr/`
- preserved service: `workers.dreamlabs.co.kr`는 별도 인증 서비스이며 이 Portal이 소유하지 않는다
- runtime authority: none

Portal은 Worker Registry, Worker API, 작업 큐, 세션, 배포 상태 또는 인증 정보를 직접
조회하지 않는다. `site/data/directory.json`은 공개 가능한 링크와 접근 유형만 담은
운영자 검토 디렉터리이며 실시간 health 데이터가 아니다.

`/download/`는 검토된 Google Drive 파일로 연결한다. 정적 Portal은 다운로드 키나
Drive 자격 증명을 받지 않으며, 파일 열람·다운로드 권한은 Google Drive에서 관리한다.

## Information architecture

```text
Portal
├─ Workers       역할별 Worker 디렉터리
├─ WorkerOps     운영 관점과 하위 시스템 책임
├─ Ecosystem     Host, Gateway, Meet, Manual, Assets, HR 연결
├─ Learn         사용자 안내와 DreamLabs Asset Pack
├─ Download      접근 제어된 Google Drive Portable ZIP 진입점
├─ About         Portal 공개·보안 경계
└─ Portal status 정적 artifact와 링크 검토 정보
```

## Repository layout

```text
site/                 deployable static files only
server/               사용 중지된 이전 key-server source; Git 이력/참고용, Pages 배포 제외
schemas/              public directory contracts
config/asset-lock.json Asset Pack provenance and runtime-use policy
scripts/              validation, deterministic packaging, local server
tests/                static contract tests
docs/                 data, architecture and operating boundaries
.github/workflows/    validation and manually gated Pages deployment
```

## Local use

```powershell
npm ci
npm run check
npm run build
npm run check:dist
npm run serve
```

Open `http://127.0.0.1:4178/`. Direct `file:` opening is unsupported because the
status page reads same-origin static JSON and the packaged build manifest through HTTP.

The active download path is the reviewed Drive URL in
[`site/data/download-config.json`](site/data/download-config.json). ZIP bytes and Drive
permissions stay outside this repository. The previous key-server experiment remains
in Git history and under `server/` only as inactive reference; it is not deployed by
the Portal or required for downloads.

## Publication boundary

Source validation, source commit, CI artifact, Pages deployment, custom-domain serving
and external acceptance are separate states. A commit or successful build alone is not
deployment evidence. See [DATA-CONTRACT.md](docs/DATA-CONTRACT.md),
[ARCHITECTURE.md](docs/ARCHITECTURE.md), and [OPERATIONS.md](docs/OPERATIONS.md).

The accepted v1 source is preserved by tag `portal-v1-accepted-20261013`. The accepted
v2 source before the Asset Pack correction is preserved by tag
`portal-v2-before-dreamlabs-assets-20261013`. The v2 design record remains under
[`docs/redesign/`](docs/redesign/README.md).
