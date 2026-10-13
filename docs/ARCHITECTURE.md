# Static Portal architecture

This design follows the approved Worker system-configuration guidance and read-only
inspection of existing DreamLabs GitHub Pages repositories.

| Area | Decision | Current state |
|---|---|---|
| repository | `ilhoko-dreamlabs/kr-co-dreamlabs-workers-portal-static` | public-data reviewed; visibility separately verified |
| local checkout | `C:\dreamlabs\github\kr-co-dreamlabs-workers-portal-static` | working source |
| UI | plain HTML, CSS and JavaScript | implemented |
| data | versioned operator-reviewed JSON snapshot | implemented |
| packaging | allowlisted copy from `site/` plus SHA-256 manifest | implemented |
| validation | static contract, security, data and Node tests | implemented locally |
| hosting | GitHub Pages custom workflow | deployed; default URL redirects to the custom domain |
| public domain | `portal.workers.dreamlabs.co.kr` | HTTPS enforced and externally accepted |
| preserved route | `workers.dreamlabs.co.kr` | separate authenticated service; unchanged |
| runtime control | none | enforced by design |

## Flow

```text
reviewed public evidence
  -> site/data/status.json
  -> source validation and tests
  -> deterministic dist artifact + hashes
  -> manually approved GitHub Pages workflow
  -> custom-domain DNS and TLS verification
  -> external HTTPS acceptance
```

The browser may read only same-origin static files and approved public image assets.
Future authenticated or live data belongs behind a separately designed service with
user authentication, per-field authorization and audit. Worker service keys must never
be exposed to this repository or browser.

## Pending decisions

- company owner and backup maintainer;
- branch protection and Pages environment reviewer support for the GitHub plan;
- snapshot owner, refresh cadence and stale threshold;
- asset hash/version qualification for immutable caching.
