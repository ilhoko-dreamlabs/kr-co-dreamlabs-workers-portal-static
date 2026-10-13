# Workers Portal v2 redesign brief

Status: design candidate · no production site change

Prepared: 2026-10-13 KST

Target: `https://portal.workers.dreamlabs.co.kr/`

## Decision

The Portal is no longer designed as a product-status dashboard. It becomes the
front door to the DreamLabs Worker ecosystem:

> Find the right Worker, understand the surrounding service, and continue to
> the correct authenticated application, guide or design resource.

The current dashboard is not incrementally restyled. Version 2 receives a new
information architecture, link registry, visual hierarchy and page set. The
existing site remains live until the replacement passes external acceptance.

## Preserved baseline

The accepted v1 baseline is commit
`57faa7cdac1f648c5908d16ec18aa9efecee0069`.

- remote recovery tag: `portal-v1-accepted-20261013`
- local full-history bundle: `C:\dreamlabs\github\_backups\kr-co-dreamlabs-workers-portal-static\20261013-57faa7c\repository.bundle`
- local source snapshot: the same directory, named with the full baseline SHA
- current Pages deployment and custom domain: unchanged by this design work

The backup tag is the rollback source boundary. The local bundle was verified
as a complete Git history. No v1 file is deleted in the design phase.

## Primary audiences and jobs

| Audience | First question | Portal outcome |
|---|---|---|
| Worker user | Which Worker should I open? | Search or filter the Worker directory and open the correct console |
| Team member | Where do I meet or collaborate? | Open Worker Meet or the approved collaboration guide |
| Operator | What is WorkerOps and which subsystem owns this task? | Open the subsystem map and continue to the owned service |
| Developer/QA | Where are the UI rules and usage guides? | Open Worker Assets or Worker Manual at the relevant section |
| Evaluator | What is Worker Host? | Open the product introduction, architecture and use cases |

## Experience principles

1. **Navigation first.** The first viewport provides useful destinations, not
   release metrics.
2. **One card, one destination.** Each card says what opens, who it is for and
   whether sign-in is expected.
3. **Access is not health.** `login required`, `public document`, `restricted`
   and `owner review` are access labels. They must never be shown as runtime
   health.
4. **Static and public by default.** Anything shipped in HTML or JSON is public.
   Restricted Worker identifiers and internal URLs are not placed in the
   deploy artifact.
5. **No browser-side probing.** The Portal never calls Worker health or APIs.
   Link review happens before build and records only public-safe results.
6. **Explain the boundaries.** Worker Gateway, Worker Meet, Worker Host and an
   individual Worker are different services even when they share the Worker
   brand.
7. **Useful without JavaScript.** Navigation and primary links remain available
   when scripts fail. Search and filters are progressive enhancement.

## Proposed content model

The home page presents four routes:

- **Open a Worker** — searchable, role-oriented Worker directory.
- **Use WorkerOps** — overview and subsystem map.
- **Meet and collaborate** — Worker Meet and approved collaboration guidance.
- **Learn and build** — Worker Host introduction, Worker Manual and Worker
  Assets.

The detailed structure is in
[INFORMATION-ARCHITECTURE.md](INFORMATION-ARCHITECTURE.md). Link publication
rules are in [LINK-CATALOG.md](LINK-CATALOG.md), and the proposed static data
contract is in [DATA-CONTRACT.md](DATA-CONTRACT.md).

## Non-goals

- live Worker status, uptime or health monitoring;
- login/session handling in the public GitHub Pages site;
- Worker Registry, deployment, restart, update or approval controls;
- publishing internal hosts, private repositories or privileged operator
  Workers;
- treating an HTTP response, source commit or image as product acceptance;
- changing `workers.dreamlabs.co.kr`, wildcard DNS, OAuth, Worker runtimes or
  Worker Meet.

## Recommended visual direction

Use the Worker UI/UX standard as a design reference, while packaging Portal
assets locally rather than hotlinking runtime CSS or JavaScript.

- warm white content surface and deep navy navigation;
- electric blue for primary actions, cyan for reference resources and amber
  only for access attention;
- generous cards and short descriptions instead of dense operations tables;
- simple ecosystem diagram, not a real-time topology map;
- visible focus, 44px touch targets, reduced-motion support and layouts that
  remain usable at 200% zoom.

## Design acceptance

The design is ready for implementation when the owner confirms:

1. which named Workers are safe to list on a public static site;
2. whether privileged operator Workers remain absent from the public catalog;
3. the display name, description and audience for each listed Worker;
4. whether links open in the same tab or a new tab by service class;
5. that WorkerOps subsystem entries without a public UI are explanation-only,
   not fake links.
