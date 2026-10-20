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

## Portable download through Google Drive

The Pages artifact contains only a reviewed Drive file URL and public artifact
identity. ZIP bytes and Google credentials must not be copied into `site/` or `dist/`.

Before changing `site/data/download-config.json`:

1. upload the immutable ZIP to the approved DreamLabs Google Drive account;
2. verify the uploaded filename, byte size and SHA-256 against the local source;
3. copy the exact Drive share URL and record access as `restricted` unless sharing was
   separately reviewed and changed;
4. update the version, filename, byte size and SHA-256 in the public config;
5. run the static validation, package and external Portal checks;
6. manage user or group access only in Google Drive.

`uploaded` proves only that the exact artifact was observed in Drive. It does not prove
that an arbitrary visitor can download it. The previous key-server implementation under
`server/` is inactive reference material and is not required by this flow.

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
