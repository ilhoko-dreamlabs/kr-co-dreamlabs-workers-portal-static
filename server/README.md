# Worker ZIP download server

This directory owns a small server-side download boundary. It is not copied into the
GitHub Pages `dist/` artifact. The public Portal contains no key and no ZIP.

## Contract

- `POST /v1/downloads`
- content type: `application/x-www-form-urlencoded`
- body fields: `artifactId`, `key`
- required `Origin`: one exact value from `publicOrigins`
- success: streamed `application/zip` attachment; one RFC 7233 byte range is supported
- failure: generic Korean retry guidance, with no key, path or request echo

The browser uses a native HTML form submission, not `fetch().blob()`, so the response is
streamed by the browser. Automatic browser retry/resume of a POST download is not yet
claimed; the server's bounded Range behavior is covered by integration tests. The key is
carried only in the HTTPS POST body. It must not be
placed in a URL, log, static JSON, browser storage or repository file.

## Local configuration

1. Copy `config.example.json` to ignored `config.local.json`.
2. Put the ZIP outside this repository and `dist/`.
3. Generate a verifier by piping a key through `npm run hash:download-key`.
4. Replace the example verifier and artifact path in `config.local.json`.
5. Set `WORKERS_DOWNLOAD_CONFIG` to that file and run `npm run serve:download`.

Adding or deleting a key means editing `keyVerifiers` and restarting the process. There
is no administrator login, SSO, RBAC or management UI. The server binds to loopback;
approved external HTTPS ingress and exact `Origin` forwarding belong to a separately
configured reverse proxy. Do not weaken the source binding to publish it directly.

The committed Portal config remains disabled until a real Portable ZIP, server endpoint
and external HTTPS acceptance exist. The download key authorizes acquisition only; the
downloaded Worker must not use it for activation, licensing or phone-home checks.

See [`../docs/DOWNLOAD-DEPLOYMENT.md`](../docs/DOWNLOAD-DEPLOYMENT.md) for the isolated
container/reverse-proxy plan. `compose.example.yml` is Linux-only and requires an
immutable image reference plus private host paths; it is not an apply manifest.
