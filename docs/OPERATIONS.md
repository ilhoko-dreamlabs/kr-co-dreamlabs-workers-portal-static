# Operations

## Release flow

1. Update `site/data/status.json` from reviewed evidence.
2. Run `npm run check`, `npm run build`, and `npm run check:dist`.
3. Review the source diff and public-data boundary.
4. Commit and push to `main` only within the approved repository scope.
5. Manually dispatch `Deploy GitHub Pages` after Pages and environment approval.
6. Record run ID, source SHA and `dist/build-manifest.json` hashes.
7. Verify the GitHub Pages URL before any custom-domain transition.

## Custom domain gate

`workers.dreamlabs.co.kr` requires a separate read-only DNS/GitOps inventory and an
approved change plan. The expected Pages CNAME target is the confirmed owner Pages
host, not the repository path. GitHub account domain verification, Pages custom-domain
configuration, DNS, certificate issuance and Enforce HTTPS are distinct checks.

Actions-based Pages publishing does not use a repository `CNAME` file. Do not commit
private keys or certificate material.

## Rollback

Prefer redeploying a previously reviewed source revision after running the current
validation and packaging gates. Verify its build manifest before deployment. DNS
rollback is separate and requires the recorded prior values and explicit approval.
