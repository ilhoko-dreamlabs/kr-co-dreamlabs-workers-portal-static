# DreamLabs Workers Portal Static

`portal.workers.dreamlabs.co.kr`용 Worker Portal 정적 사이트다. 이 저장소는 Worker Host
Service Unit과 분리해 관리하며 HTML, CSS, JavaScript와 운영자가 검토한 JSON
snapshot만 게시한다.

## Current state

- repository: `ilhoko-dreamlabs/kr-co-dreamlabs-workers-portal-static`
- publication: public-data reviewed; repository visibility is controlled in GitHub settings
- default branch: `main`
- hosting: GitHub Pages workflow deployed; the default github.io URL redirects to the custom domain
- custom domain: `https://portal.workers.dreamlabs.co.kr/` deployed with HTTPS enforced and externally accepted
- preserved service: `workers.dreamlabs.co.kr` remains a separate authenticated service and was not changed
- runtime authority: none

Portal은 Worker Registry, Update Manager, Worker API 또는 인증된 Runtime을 직접
조회하지 않는다. 화면의 상태는 `site/data/status.json`의 운영자 검토 snapshot이며
관측 시각과 stale 기준을 명시한다.

## Layout

```text
site/                 deployable static files only
schemas/              public snapshot contract
config/asset-lock.json referenced asset paths and qualification
scripts/              validation, deterministic packaging, local server
tests/                static contract tests
docs/                 data and operating boundaries
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

Open `http://127.0.0.1:4178/`. Opening `site/index.html` directly is unsupported
because the page loads its snapshot through HTTP.

## Publishing boundary

The Pages workflow is manual. Repository visibility, Pages activation, the
`github-pages` environment, custom-domain configuration, DNS and HTTPS enforcement
remain independently verifiable states. A source push is not evidence that any of
those actions completed.

See [DATA-CONTRACT.md](docs/DATA-CONTRACT.md) and
[OPERATIONS.md](docs/OPERATIONS.md).
