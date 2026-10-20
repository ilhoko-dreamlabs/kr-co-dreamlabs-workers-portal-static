# Static Portal architecture

The Portal deployable remains a credential-free static navigation layer. Its download
page opens one reviewed same-origin password-protected ZIP. The password is distributed
out of band and never handled by Portal code.

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
| Portable download | pinned release asset copied into Pages after SHA-256 verification | password remains outside source, release metadata and Portal |

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
There are no service tokens, WebSockets or Worker control commands. The download page
validates that the configured destination is a same-origin `/downloads/*.zip` URL.
Portal JavaScript never receives the archive password.

The former key-verifying server source remains under `server/` only as inactive
reference and is never copied to Pages `dist/`. It is not part of the active download
architecture and must not be deployed for the current Portal flow.

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
- GitHub Release owns the immutable source asset; the Pages workflow owns exact digest
  verification and same-origin publication; Portal owns only the reviewed link and
  published artifact identity.

Operator-only Workers, internal management endpoints and raw operational evidence are
intentionally absent from the public directory.
