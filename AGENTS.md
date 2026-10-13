# AGENTS.md

This repository owns the separate static DreamLabs Worker Portal published for
`workers.dreamlabs.co.kr`. It does not own Worker Host runtime, Worker Registry,
Update Manager, DNS, TLS, public asset hosting or authenticated Worker APIs.

## Rules

- Keep the deployable site under `site/` and browser code credential-free.
- Treat `site/data/status.json` as a reviewed public snapshot, never a live control
  plane or automatic projection of private repositories.
- Keep planning, design, development, validation, release, named runtime and
  acceptance states separate.
- Do not claim deployment from a local build, commit, push or Actions artifact.
- Do not add Worker credentials, API keys, cookies, private endpoints or raw private
  evidence.
- Preserve the exact candidate/deployed/runtime-applied distinction for remote assets.
- GitHub Pages activation, public visibility, custom domain, DNS and TLS changes need
  their own explicit operating approval and readback.

## Development flow

1. Run `git status --short`, `git log -1 --oneline` and inspect the remote branch.
2. Stop on unrelated changes that overlap the task.
3. Make the smallest coherent static-site change.
4. Run `npm run check`, `npm run build`, `npm run check:dist`, and `git diff --check`.
5. Visually inspect desktop and narrow layouts when UI changes.
6. Commit or push only when the user authorized a repository update.

Report source, CI artifact, Pages deployment, custom domain and external acceptance as
separate states.
