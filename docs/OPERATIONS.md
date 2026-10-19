# Operations

## Release flow

1. Review public destinations and update the static directory if needed.
2. Run `npm run check`, `npm run build`, `npm run check:dist`, and `git diff --check`.
3. Visually inspect desktop and narrow layouts, keyboard navigation, filters and 200%
   zoom.
4. Review the exact source diff and public-data boundary.
5. Merge through protected `main` after required validation.
6. Manually dispatch `Deploy GitHub Pages` at the exact `main` revision.
7. Record workflow run, source SHA and `dist/build-manifest.json` readback.
8. Verify the custom-domain routes, assets, 404, HTTP redirect, DNS and certificate.

Source, validation, release artifact, Pages deployment and external acceptance must be
reported separately. Do not use a successful earlier stage as evidence for a later one.

## Portable download server

The Pages artifact and download server are separate deployables. `npm run build` copies
only `site/`; it must not package `server/`, private configuration or ZIP files.

Before changing `site/data/download-config.json` to `enabled: true`:

1. place the immutable ZIP outside this repository and record version, size and SHA-256;
2. create ignored server configuration with an exact Portal origin, verifier and one
   artifact mapping;
3. run the download integration tests with synthetic data, then validate the real file
   path and hash without printing the key;
4. deploy the server behind an approved HTTPS reverse proxy while retaining loopback
   application binding;
5. verify correct/wrong key, wrong Origin, unknown artifact, Range behavior, streaming,
   log redaction and that direct storage access is denied;
6. update the public endpoint and metadata, rebuild Pages and perform external UI tests.

Keys are added or removed by editing the private server config and restarting the
process. There is no administrator web UI. Do not place keys in command arguments,
URLs, access logs, browser storage, public JSON or repository history. This key controls
download only and must not become Worker activation or online license authority.

## Custom domain gate

The accepted hostname is `portal.workers.dreamlabs.co.kr`. Its DNS CNAME must continue
to identify the confirmed GitHub Pages owner host. `workers.dreamlabs.co.kr`, wildcard
records and sibling subdomains are outside this repository's ownership.

The accepted state requires all of the following readbacks:

- GitHub Pages reports HTTPS enforcement enabled;
- HTTP redirects to the canonical HTTPS URL;
- the certificate SAN matches `portal.workers.dreamlabs.co.kr` and its chain validates;
- public DNS resolves through the expected Pages owner;
- the deployed build manifest identifies the exact source commit;
- every Portal route, local asset and JSON document is available over HTTPS.

Actions-based Pages publishing does not use a repository `CNAME` file. Never commit
private keys or certificate material.

## Rollback

The last accepted v1 source is tagged `portal-v1-accepted-20261013`. Prefer creating a
reviewed rollback change from that immutable reference, running the current validation
and packaging gates, and deploying the resulting exact artifact. DNS rollback is a
separate protected operation and is unnecessary when the custom domain and Pages owner
do not change. Never modify the parent service, wildcard or unrelated subdomains as part
of Portal rollback.
