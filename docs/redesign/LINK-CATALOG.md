# Reviewed link catalog

Review date: 2026-10-15 KST

Scope: unauthenticated external HTTPS read only

This catalog is a design input, not a live service monitor. HTTP results only
prove the response observed from the review client. They do not prove feature
acceptance, authorization, Worker health or current image identity.

## Evidence levels

| Level | Meaning |
|---|---|
| `https-observed` | TLS verification succeeded and the exact URL returned an expected public/auth response during review |
| `manifest-backed` | an authoritative route/service manifest names the destination |
| `candidate-only` | source proposes a URL, but publication needs owner approval or stronger evidence |
| `restricted` | do not publish the exact destination in a public static artifact |

## Ecosystem destinations

| Portal label | URL | Observed result | Intended card |
|---|---|---|---|
| Worker Host 소개 | `https://worker-host.dreamlabs.co.kr/` | HTTPS 200 | Product introduction |
| 왜 WorkerOps인가 | `https://worker-host.dreamlabs.co.kr/why-workerops/` | HTTPS 200 | WorkerOps overview |
| WorkerOps 운영 장면 | `https://worker-host.dreamlabs.co.kr/workerops-in-action/` | HTTPS 200 | Operational examples and evidence boundaries |
| Worker Host 전체 구조 | `https://worker-host.dreamlabs.co.kr/#architecture` | page/anchor source reviewed | Architecture deep link |
| Worker Meet | `https://worker-meet.dreamlabs.co.kr/` | HTTPS 200; native application | Meeting/collaboration application |
| Worker Gateway 로그인 | `https://workers.dreamlabs.co.kr/oauth2/sign_in` | HTTPS 200; sign-in page | Authentication boundary explanation, not Portal home |
| Worker Manual | `https://manual.workers.dreamlabs.co.kr/` | HTTPS 200 | User/admin guide hub |
| DreamLabs Assets | `https://assets.dreamlabs.co.kr/` | HTTPS 200; Asset Pack 0.1.2 candidate-inspection, mixed approval | Brand, Worker, product and footer assets |
| DreamLabs HR System | `https://hr.dreamlabs.co.kr/` | HTTPS 200; application shell and route manifest reviewed | Connected organization/role system; access policy owner review required |

## Worker Host use cases

The Worker Host public site exposed the following stable use-case routes during
the 2026-10-15 review. These are product explanations, not named Worker health
or deployment evidence.

| Use case | URL | Observed result |
|---|---|---|
| 판매·수익성 분석 | `https://worker-host.dreamlabs.co.kr/use-cases/sales-data-analysis/` | HTTPS 200 |
| 기관 문서업무 | `https://worker-host.dreamlabs.co.kr/use-cases/institution-documents/` | HTTPS 200 |
| 기업 운영업무 | `https://worker-host.dreamlabs.co.kr/use-cases/business-operations/` | HTTPS 200 |
| 유튜브 콘텐츠 운영 | `https://worker-host.dreamlabs.co.kr/use-cases/youtube-content-operations/` | HTTPS 200 |
| 작은 개발팀 | `https://worker-host.dreamlabs.co.kr/use-cases/software-team/` | HTTPS 200 |

The Gateway entry is secondary. Users normally select a Worker first and are
then sent through the correct authentication boundary.

HR System is also secondary and appears in a `Connected systems` collection.
Its route and service are owned outside this Portal repository. The Portal must
not describe HR as a Worker runtime, Gateway component or WorkerOps control
plane, and a 200 shell response does not settle its authorization policy.

## Named Worker destinations

These endpoints were observed over HTTPS, but publication still requires the
catalog owner to approve their display names and public listing.

| Proposed display name | Destination | Observed response | Proposed access label | Publication state |
|---|---|---|---|---|
| Worker 0 | `https://worker0.workers.dreamlabs.co.kr/` | 403 sign-in response | DreamLabs 로그인 | owner review |
| Worker 1 | `https://worker1.workers.dreamlabs.co.kr/` | 403 sign-in response | DreamLabs 로그인 | owner review |
| Claude Worker | `https://claude-worker.workers.dreamlabs.co.kr/` | 403 sign-in response | DreamLabs 로그인 | owner review |
| DL Sales Worker | `https://dl-sales-worker.workers.dreamlabs.co.kr/` | 200 application shell | 접근 정책 확인 | owner review |
| DL Dev Worker | `https://dl-dev-worker.workers.dreamlabs.co.kr/` | 200 application shell | 접근 정책 확인 | owner review |
| WC Dev Worker | `https://wc-dev-worker.workers.dreamlabs.co.kr/` | 200 application shell | 접근 정책 확인 | owner review |
| Support Worker | `https://support-worker.workers.dreamlabs.co.kr/` | 200 application shell; route manifest exists | 접근 정책 확인 | owner review |
| Worker Developer | `https://dl-worker-developer.workers.dreamlabs.co.kr/` | 302 to native login | 로그인 필요 | owner review |

A privileged operator Worker was also discovered. Its exact destination is
intentionally omitted from the public-repository design catalog. A public
static site cannot hide data in HTML, JSON or JavaScript; if that Worker must
be discoverable, it belongs in a separately authenticated directory.

## Manual deep-link groups

The Manual currently exposes stable guide routes. The first Portal version
should curate these groups rather than copy all manual content:

| Group | Example destination |
|---|---|
| Start | `https://manual.workers.dreamlabs.co.kr/guide/new-session/` |
| Navigate | `https://manual.workers.dreamlabs.co.kr/guide/console-navigation/` |
| Projects | `https://manual.workers.dreamlabs.co.kr/guide/projects/` |
| Skills | `https://manual.workers.dreamlabs.co.kr/guide/skill-registry/` |
| Collaboration | `https://manual.workers.dreamlabs.co.kr/guide/remote-collaboration/` |
| Updates | `https://manual.workers.dreamlabs.co.kr/guide/whole-update/` |
| Troubleshoot | `https://manual.workers.dreamlabs.co.kr/guide/troubleshooting/` |
| Release history | `https://manual.workers.dreamlabs.co.kr/guide/release-history/` |

Candidate-labelled manual pages are excluded from primary Portal navigation.
They can be added only with an explicit candidate badge and approved wording.

## Assets deep-link groups

The Portal links to the Asset Pack home and its published DreamLabs Brand,
Worker Host, Product Logos and Footer Assets collections. Asset Pack deployment
does not itself mean runtime adoption or approval: the Portal must retain each
asset's source approval state. At release time, the only approved runtime asset
is the Worker Agent icon recorded in `config/asset-lock.json`; candidate assets
remain design/review references.

## Publication rules

1. An item needs a public-safe title, summary, audience, access label and owner.
2. `https-observed` must be refreshed immediately before release.
3. A 200 application shell is not proof that anonymous access is intended.
4. 302/401/403 may be correct for an authenticated destination and should be
   displayed as `login required`, not `broken`.
5. Exact internal upstreams, health endpoints, credentials and protected job
   identifiers are never copied into Portal data.
6. Privileged or unapproved Worker identities are absent from the static build.
7. Removed or failed destinations retain a review record in Git but lose their
   clickable action in the built site.
