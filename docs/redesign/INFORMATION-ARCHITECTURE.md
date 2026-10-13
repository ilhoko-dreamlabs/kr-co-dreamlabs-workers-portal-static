# Information architecture

## Sitemap

```text
/
├─ workers/                 searchable public-safe Worker directory
├─ workerops/               WorkerOps overview and subsystem map
├─ ecosystem/               Worker Host, Gateway, Meet and support services
├─ learn/                   Manual, UI/UX Assets and product introduction
├─ about/                   static/public boundary and link-review policy
├─ status/                  Portal delivery facts only, not Worker health
└─ 404.html                 recovery links to Workers, WorkerOps and Learn
```

The first release may render these routes from one source registry, but each
route must have a stable URL and work without client-side routing.

## Global navigation

| Label | Destination | Purpose |
|---|---|---|
| Portal | `/` | task-oriented start page |
| Workers | `/workers/` | individual Worker links |
| WorkerOps | `/workerops/` | operating model and subsystem map |
| Ecosystem | `/ecosystem/` | Worker Host, Gateway, Meet and support services |
| Learn | `/learn/` | manuals, standards and product material |

The header also carries one primary action, `Worker 찾기`, which focuses the
directory search. It does not present an artificial global status indicator.

## Home page order

1. **Hero — “어디로 가야 할지 바로 찾는 Worker Portal”**
   - compact explanation;
   - primary action: `Worker 찾기`;
   - secondary action: `WorkerOps 이해하기`.
2. **Quick destinations**
   - Worker directory;
   - Worker Meet;
   - Worker Manual;
   - Worker Assets.
3. **Worker directory preview**
   - six most useful public-safe entries;
   - search and access/type filters;
   - `모든 Worker 보기`.
4. **WorkerOps ecosystem**
   - a small relationship map;
   - cards for Worker Host, Gateway, Meet, Manual and Assets;
   - subsystem entries without a public UI are labelled `설명` or `준비 중`.
5. **Start by intent**
   - 업무 실행;
   - 회의/협업;
   - 사용법 찾기;
   - UI 구현;
   - 제품/구조 이해.
6. **Access notice**
   - Portal is public/static;
   - linked applications may require DreamLabs authentication;
   - access denial is not a Portal failure.
7. **Footer**
   - Portal boundary, link review date and Portal source revision.

## Worker directory

### Filters

- role: General, Development, Sales, Support, Organization-specific;
- access: Login required, Access controlled, Public information;
- environment: Operating, Preview, Documentation-only;
- text search across display name, purpose and keywords.

Environment is a catalog classification, not a deployment claim. A card must
not display `Operating` unless the catalog owner has approved that public term.

### Card contract

```text
[icon] Display name                         [로그인 필요]
       One-sentence purpose
       Audience · Role · Last link review
       [열기] [사용 가이드]
```

Required behaviors:

- the main action identifies the destination before navigation;
- external/app links include an accessible announcement;
- unavailable or owner-review items are not clickable;
- a failed link-review record removes the launch action in the next build;
- no card claims live health, idle/busy state, current image or readiness.

## WorkerOps page

WorkerOps is explained as the operating approach around role-based Workers,
not as a single omnipotent control service.

```text
People and team decisions
          |
          v
Worker Portal ── discover and navigate
          |
   +------+------+-------------------+
   |             |                   |
Worker Host   Worker Gateway      Worker Meet
product and   authentication      meeting and
execution     boundary            collaboration
   |             |                   |
   +------+------+-------------------+
          |
   Manual · Assets · evidence
```

Subsystem presentation rules:

| Subsystem | Portal treatment |
|---|---|
| Worker Host | product introduction and architecture links |
| WorkerOps overview | `why WorkerOps` and `in action` links |
| Worker Gateway | explain authentication role; do not describe it as the Portal |
| Worker Meet | application link with authentication expectation |
| Worker Manual | guide hub plus selected deep links |
| Worker Assets | UI/UX standards and patterns |
| Worker Registry / Update / Portainer | explanation-only unless a separately approved public UI exists |

## Ecosystem page

This page answers `which system owns this job?` using a responsibility table.

| Need | Open | Does not imply |
|---|---|---|
| run role-specific work | a listed Worker | access to other Workers or admin functions |
| understand the product | Worker Host site | a runtime/deployment status claim |
| authenticate to protected Worker routes | Worker Gateway sign-in | Portal authentication or authorization |
| meet and collaborate | Worker Meet | automatic Worker-to-Worker orchestration |
| learn a feature | Worker Manual | that every Worker has the feature deployed |
| implement consistent UI | Worker Assets | runtime hotlinking or automatic adoption |

## Learn page

The page contains three collections:

1. **Product** — Worker Host home, WorkerOps overview, architecture and use
   cases.
2. **Use** — Manual home, first session, projects, skills, collaboration,
   updates and troubleshooting.
3. **Build** — Assets home, foundations, components, patterns, templates and
   releases.

Deep links are curated in the Portal registry. The Portal does not scrape the
manual or assets site in the browser.

## Responsive behavior

### Desktop

- maximum 1280px content canvas;
- five-item header navigation;
- Worker cards in three columns;
- ecosystem map next to subsystem list.

### Tablet

- Worker cards in two columns;
- ecosystem map becomes stacked bands;
- quick actions remain above the first scroll break.

### Mobile

- one compact header and accessible drawer;
- search immediately below the hero;
- horizontal filter chips may scroll, but page content must not overflow;
- Worker cards are a single column with full-width actions;
- ecosystem map becomes a semantic ordered list.

## Accessibility and interaction gates

- semantic headings and landmarks with one page-level `h1`;
- skip link and visible `:focus-visible` treatment;
- keyboard-complete drawer, filter, search and dialog behavior;
- no hover-only meaning;
- `prefers-reduced-motion` and 200% zoom without lost content;
- icons have text labels or are hidden from assistive technology;
- access/type are written in text and not encoded by color alone;
- empty, unavailable and stale catalog states provide recovery actions.
