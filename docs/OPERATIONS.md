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

## Password-protected Portable download

The tracked source contains only public artifact identity and one pinned release asset
URL. The encrypted ZIP is copied into `dist/downloads/` by the Pages workflow after
exact SHA-256 validation. The archive password stays outside GitHub and Portal.

Before changing `site/data/download-config.json`:

1. create a Windows-compatible password-protected ZIP without writing the password to
   scripts, source or command output;
2. verify correct-password success and wrong-password failure;
3. upload the exact ZIP as a GitHub release asset and verify its recorded size/digest;
4. update the pinned release URL, filename, byte size and SHA-256 in the public config
   and Pages workflow;
5. run validation and deploy the exact Pages artifact;
6. verify the same-domain ZIP response, size, SHA-256 and password behavior externally.

The password provides convenient customer delivery protection, not user-level access
control or audit. The previous key-server implementation under `server/` is inactive
reference material and is not required by this flow.

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
