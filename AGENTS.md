# AGENTS.md

This repository owns the separate static DreamLabs Worker Portal published for
`portal.workers.dreamlabs.co.kr`. The active Portable download path is a reviewed,
access-controlled Google Drive file link; Drive owns file access. The preserved
`server/` source is legacy-only and must never be copied into `site/` or the GitHub
Pages `dist/` artifact. This repository does not own Worker Host runtime,
Worker Registry, Update Manager, DNS, TLS, public asset hosting or authenticated Worker
APIs.

## Rules

- Keep the Pages-deployable site under `site/` and browser JavaScript credential-free.
  The download page may link only to the reviewed Google Drive file recorded in the
  public download config. It must not collect, transform, persist or log a key.
- Treat `site/data/directory.json` and `site/data/portal-status.json` as reviewed
  public static data, never a live control plane or automatic projection of private
  repositories.
- Keep planning, design, development, validation, release, named runtime and
  acceptance states separate.
- Do not claim deployment from a local build, commit, push or Actions artifact.
- Do not add Worker credentials, API keys, cookies, private endpoints or raw private
  evidence.
- Keep ZIP bytes, Drive credentials and private filesystem paths outside tracked source,
  `site/` and `dist/`. Sharing changes remain a Google Drive operation and require
  explicit permission review.
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
