# Static Portal architecture

The Portal is a static, credential-free navigation layer. It explains public-safe
service responsibilities and links users to each service's own authentication boundary.

| Area | Decision | Boundary |
|---|---|---|
| repository | `ilhoko-dreamlabs/kr-co-dreamlabs-workers-portal-static` | separate from Worker Host runtime source |
| UI | plain HTML, CSS and JavaScript | no framework runtime or inline script |
| data | versioned operator-reviewed JSON | no live Worker or account data |
| assets | tracked hybrid use | the approved Worker Agent icon is loaded from `assets.dreamlabs.co.kr`; candidate tokens are a documented design reference |
| packaging | recursive static copy plus SHA-256 manifest | exact source revision recorded at build |
| validation | static contract, security scan and Node tests | runs before artifact upload |
| hosting | GitHub Pages custom workflow | source, artifact and deployment remain distinct |
| public domain | `portal.workers.dreamlabs.co.kr` | parent and sibling services remain independent |
| runtime control | none | enforced in data contract and browser-code checks |

## Publication flow

```text
operator-reviewed public links
  -> site/data/directory.json
  -> source validation and tests
  -> deterministic dist artifact + build manifest
  -> manually dispatched GitHub Pages workflow
  -> custom-domain and external HTTPS acceptance
```

The browser fetches only `portal-status.json` and the artifact's `build-manifest.json`
from the same origin. Search and filters run on HTML already packaged with the site.
There are no authenticated API calls, service tokens, WebSockets or control commands.

## Responsibility boundaries

- Role Workers own task execution within their own authenticated context.
- Worker Gateway owns authentication at protected Worker addresses.
- Worker Meet owns meeting and collaboration flows.
- Worker Manual owns user and administrator guidance.
- DreamLabs Assets owns the public Asset Pack. The Portal uses only the catalog's
  approved Worker Agent icon at runtime and does not present candidate assets as approved.
- DreamLabs HR System is a connected business system, not WorkerOps infrastructure or
  Worker runtime.
- Portal owns only public navigation, explanation and its own publication facts.

Operator-only Workers, internal management endpoints and raw operational evidence are
intentionally absent from the public directory.
