# AGENTS.md

This repository owns the separate static DreamLabs Worker Portal published for
`portal.workers.dreamlabs.co.kr` and the source for the minimal `server/` download
boundary that matches pre-registered key verifiers and streams one configured private
ZIP. The server source is a separate deployable and must never be copied into `site/`
or the GitHub Pages `dist/` artifact. This repository does not own Worker Host runtime,
Worker Registry, Update Manager, DNS, TLS, public asset hosting or authenticated Worker
APIs.

## Rules

- Keep the Pages-deployable site under `site/` and browser JavaScript credential-free.
  The narrow download exception is a native HTML form that submits a user-entered key
  directly to the configured HTTPS server; JavaScript must not read, transform, persist
  or log the key.
- Treat `site/data/directory.json` and `site/data/portal-status.json` as reviewed
  public static data, never a live control plane or automatic projection of private
  repositories.
- Keep planning, design, development, validation, release, named runtime and
  acceptance states separate.
- Do not claim deployment from a local build, commit, push or Actions artifact.
- Do not add Worker credentials, API keys, cookies, private endpoints or raw private
  evidence.
- Keep usable download keys, verifier configuration, private ZIP paths and ZIP files
  outside tracked source, `site/` and `dist/`. Actual server/reverse-proxy deployment,
  private configuration, artifact placement and external HTTPS acceptance require
  separate operating approval and readback.
- Preserve the exact candidate/deployed/runtime-applied distinction for remote assets.
- GitHub Pages activation, public visibility, custom domain, DNS and TLS changes need
  their own explicit operating approval and readback.

## Development flow

1. Run `git status --short`, `git log -1 --oneline` and inspect the remote branch.
2. Stop on unrelated changes that overlap the task.
3. Make the smallest coherent static-site or bounded download-server source change.
4. Run `npm run check`, `npm run build`, `npm run check:dist`, and `git diff --check`.
5. Visually inspect desktop and narrow layouts when UI changes.
6. Commit or push only when the user authorized a repository update.

Report source, CI artifact, Pages deployment, custom domain and external acceptance as
separate states.
