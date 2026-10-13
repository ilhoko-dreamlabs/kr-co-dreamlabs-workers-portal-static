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
