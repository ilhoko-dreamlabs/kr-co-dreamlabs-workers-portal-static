# Operations

## Release flow

1. Update `site/data/status.json` from reviewed evidence.
2. Run `npm run check`, `npm run build`, and `npm run check:dist`.
3. Review the source diff and public-data boundary.
4. Commit and push to `main` only within the approved repository scope.
5. Manually dispatch `Deploy GitHub Pages` after Pages and environment approval.
6. Record run ID, source SHA and `dist/build-manifest.json` hashes.
7. Verify the exact deployed commit at both the default and custom-domain routes.

## Custom domain gate

The accepted Portal hostname is `portal.workers.dreamlabs.co.kr`. Its DNS owner is an
exact CNAME to `ilhoko-dreamlabs.github.io`; the parent `workers.dreamlabs.co.kr`
service and other subdomains remain outside this repository's ownership. Pages
custom-domain configuration, DNS, certificate issuance, Enforce HTTPS and external
acceptance remain distinct checks for every future transition.

The current accepted state requires all of the following readbacks:

- GitHub Pages reports the certificate as approved and HTTPS enforcement enabled;
- HTTP redirects to the canonical HTTPS URL;
- the certificate SAN matches `portal.workers.dreamlabs.co.kr` and its chain validates;
- the public DNS CNAME resolves to the confirmed owner Pages host;
- the deployed build manifest identifies the exact source commit.

Actions-based Pages publishing does not use a repository `CNAME` file. Do not commit
private keys or certificate material.

## Rollback

Prefer redeploying a previously reviewed source revision after running the current
validation and packaging gates. Verify its build manifest before deployment. DNS
rollback is separate and requires the protected GitOps job, the recorded prior
ownership state and explicit approval. Do not alter the parent service, wildcard or
unrelated subdomains as part of a Portal rollback.
