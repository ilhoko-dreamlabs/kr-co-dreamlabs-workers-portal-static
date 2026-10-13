# Implementation and cutover plan

## Delivery strategy

Build v2 on a feature branch and keep the accepted v1 deployment untouched.
The custom domain and hosting provider do not need to change. The production
cutover is a Pages artifact replacement only after content, link, browser and
external acceptance gates pass.

## Phases

| Phase | Scope | Exit gate | State |
|---:|---|---|---|
| 0 | preserve v1 commit, tag and offline backup | remote tag plus verified Git bundle | pass |
| 1 | approve public Worker inventory and copy | every listed item has owner, access and exposure decision | pending owner review |
| 2 | implement v2 data schema and validators | schema/security/link fixtures pass | planned |
| 3 | implement new static pages and local assets | no-JS navigation, search/filter enhancement and deterministic build pass | planned |
| 4 | content and security review | no restricted identity, internal address, credential or false status claim | planned |
| 5 | browser acceptance | desktop/mobile/keyboard/200% zoom/404/error states pass | planned |
| 6 | Pages candidate and external link review | exact artifact, CSP, assets, links and console pass | planned |
| 7 | production cutover | custom domain serves exact accepted commit/artifact | deploy pending |
| 8 | post-cutover watch and v1 retention | no regression; backup and rollback path preserved | planned |

## Proposed file shape

```text
site/
├─ index.html
├─ workers/index.html
├─ workerops/index.html
├─ ecosystem/index.html
├─ learn/index.html
├─ about/index.html
├─ status/index.html
├─ 404.html
├─ css/portal.css
├─ js/portal.js
├─ data/directory.json
├─ data/collections.json
├─ data/portal-status.json
└─ assets/                 locally packaged, hash-locked icons/logos
schemas/
├─ directory.schema.json
├─ collections.schema.json
└─ portal-status.schema.json
```

The v1 `status.json` and dashboard implementation are removed from the v2
deploy artifact only after the backup and rollback checks remain valid. Git
history preserves the original files.

## Implementation work packages

### WP1 — catalog and governance

- add v2 schemas and allowlisted host policy;
- encode approved ecosystem links, connected HR System and Worker cards;
- distinguish access, exposure and availability;
- add public-data and credential-pattern validation;
- add expected-response classes for link checks.

### WP2 — static shell

- create stable multi-page HTML routes;
- package approved visual assets locally with hashes;
- implement semantic header, footer, cards and ecosystem map;
- keep primary links usable without JavaScript;
- set CSP to the minimum hosts actually needed.

### WP3 — progressive behavior

- directory search and filters;
- mobile navigation with focus return;
- shareable query parameters only if they contain no sensitive values;
- catalog stale/load-error states;
- no Worker/API fetches or login handling.

### WP4 — validation

- schema, allowlist, prohibited-value and link-fixture tests;
- deterministic packaging and build manifest verification;
- internal route/anchor validation;
- browser checks at 1440px, 390px and 200% zoom;
- keyboard, reduced motion, screen-reader names and no-JS smoke;
- external HTTPS/CSP/mixed-content/console/broken-asset review.

## Cutover gates

The release can be called `deployed` only when the exact accepted source and
artifact are served by Pages. It can be called `accepted` only after:

- `portal.workers.dreamlabs.co.kr` serves the exact v2 build manifest;
- all Portal routes, 404 and local assets return expected responses;
- the public Worker catalog contains only owner-approved items;
- authenticated links produce their documented login/access response;
- Worker Host, WorkerOps, Meet, Manual and Assets links work;
- browser console, CSP and mixed-content checks are clean;
- desktop/mobile/keyboard/200% zoom checks pass;
- the v1 tag and offline bundle still verify.

## Rollback

1. Stop if the candidate artifact, catalog or browser acceptance fails.
2. Do not change DNS: the custom domain already points to the same Pages site.
3. Redeploy the artifact built from `portal-v1-accepted-20261013`, or rebuild
   it from the verified bundle if the original workflow artifact is unavailable.
4. Verify the v1 build manifest, home page, CSS, JavaScript, snapshot and 404.
5. Record the failed v2 commit/artifact and keep it off `main` until corrected.

Rollback never changes Worker Gateway, wildcard DNS, Worker runtimes, Worker
Meet, Manual or Assets.

## Decisions needed before implementation

| Decision | Recommendation |
|---|---|
| public named-Worker inventory | publish only explicitly owner-approved, already intended external destinations |
| privileged operator Workers | keep out of the public static catalog; use an authenticated directory if discovery is required |
| WorkerOps subsystems with no public UI | show explanation-only cards, never placeholder links |
| v1 status dashboard | remove from the home page; retain only Portal delivery facts under `/status/` |
| visual assets | package approved files locally and lock hashes; do not hotlink CSS/JS |
| link opening | same tab for documents; new tab for authenticated applications with accessible notice |

## Recommended next step

Approve the public Worker inventory and display copy first. Then implement WP1
and WP2 on the feature branch, publish a non-production artifact for visual
review, and only afterward schedule the Pages cutover.
