# Static Portal architecture

The Portal deployable remains a credential-free static navigation layer. Its download
form accepts a user-entered key but JavaScript never reads or stores it: the browser
posts it directly to a separately deployed server that owns validation and streaming.

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
| Portable download | native HTTPS POST form plus separate Node server | no ZIP, key verifier or private path in Pages/dist |

## Publication flow

```text
operator-reviewed public links
  -> site/data/directory.json
  -> source validation and tests
  -> deterministic dist artifact + build manifest
  -> manually dispatched GitHub Pages workflow
  -> custom-domain and external HTTPS acceptance
```

The browser fetches only reviewed public status/config JSON and the artifact's
`build-manifest.json` from the same origin. Search and filters run on packaged HTML.
There are no service tokens, WebSockets or Worker control commands. The download form
uses one explicitly configured HTTPS endpoint and sends `artifactId` plus the user's
key as an `application/x-www-form-urlencoded` POST. Successful response bytes stream
as an attachment; the static script does not buffer the ZIP or read the key.

The server source lives under `server/` but is never copied to Pages `dist/`. It binds
to loopback, requires an exact public Portal `Origin`, compares SHA-256 key verifiers,
maps one reviewed artifact ID to one absolute file outside the repository, and supports
one bounded byte range. External TLS/reverse proxy and process supervision are separate
deployment responsibilities. It has no administrator login, customer account model,
quota, license activation or Worker runtime authority.

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
- Download server owns only configured-key matching and configured private ZIP transfer.

Operator-only Workers, internal management endpoints and raw operational evidence are
intentionally absent from the public directory.
