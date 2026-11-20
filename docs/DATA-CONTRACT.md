# Portal data contracts

The Portal publishes four JSON documents. All are static source files reviewed before
release; none is a live Worker API.

## `site/data/directory.json`

- schema: `schemas/directory.schema.json`, version `2.0.0`;
- source kind: `operator-reviewed-directory`;
- items: public-listable Workers, products, services, guides, standards and connected
  business systems;
- access: whether the destination is public, requires login or is access-controlled;
- availability: evidence that its HTTPS representative route was observed, not runtime
  readiness;
- actions: allowlisted public HTTPS destinations.

`access`, `exposure` and `availability` are intentionally independent. An observed HTTPS
response may be a login page or protected application shell and does not prove Worker
health or user authorization.

### Phase-A Worker Console import compatibility

The optional Phase-A compatibility profile is
`contracts/worker-directory-import-phase-a.json`. It narrows only what a Worker Console
consumer may import from the existing public directory; it does not narrow or replace the
general version 2 directory schema.

The compatible projection selects items whose `kind` is `worker` and whose `exposure` is
`public-listable`, then maps only:

- `id` to the Portal source ID;
- `title` to a suggested local label;
- `summary` to public description;
- `url` to a representative navigation URL;
- `tags` to public descriptive tags; and
- root `reviewedAt` to source provenance.

These values form a configuration draft only. Portal `id` is not a Worker runtime ID,
instance ID, Connector ID or principal. The representative URL is not an RRA
`targetOrigin`. Neither value supplies a credential, permission, visibility grant,
target identity or execution authority. A Console must collect and confirm those local
values separately before using its existing Connector mutation contract.

`reviewedAt` and `linkReview.observedAt` are RFC 3339 instants with an explicit offset.
Consumers may normalize the same instant to UTC. Directory `items` ordering has no
identity, precedence or revision meaning; the Phase-A consumer sorts projected entries by
Portal ID. Tag ordering is different: the ordered tag array is preserved, so a tag-order
change is a projected source change. Absence from a later snapshot means only that the
item is not published by that snapshot; it must not automatically delete, disable or
rewrite a local setting.

The Portal does not publish a monotonic directory revision, signature or projection
digest in this contract. A consumer-computed canonical digest belongs to that consumer's
projected fields and is suitable only for local change detection. In the reviewed Worker
consumer, `catalogDigest` includes normalized root `reviewedAt` plus the selected Worker
projection, while an `itemDigest` excludes `reviewedAt`. Changes limited to excluded
non-Worker metadata therefore need not change that consumer's `catalogDigest`. None of
these digests is a Portal revision, signature, authenticity proof or authorization
decision.

Public directory IDs are reserved in `contracts/directory-id-reservations.json`. An ID
must not be reassigned to another semantic destination. When an entry is removed, its
reservation changes to `retired` and remains in the ledger; restoring or superseding an
entry requires explicit operator review. Automated checks enforce ledger uniqueness,
active/current alignment and the Phase-A limits, while semantic identity remains a
review responsibility.

For cross-repository tests, the initial frozen source fixture is the immutable Git object:

```text
commit: ed00f2d86be9a87e2f344c002b66f709f39fb2b5
path: site/data/directory.json
bytes: 14846
sha256: 91255397c969e99f267cbcb2488934d047934361bb258bf7843240f58104c499
git blob: 88c21760d88244f9409aa13d52da8cdf85724d20
```

Later Portal publications are compared with this fixture; they do not mutate it.

## `site/data/collections.json`

- schema: `schemas/collections.schema.json`, version `2.0.0`;
- groups directory item IDs for Workers, WorkerOps, learning and connected systems;
- every reference must resolve to a published directory item.

## `site/data/portal-status.json`

- schema: `schemas/portal-status.schema.json`, version `2.0.0`;
- records only the catalog review timestamp and the Portal's static-publication boundary;
- `runtimeAuthority` and `liveWorkerData` must remain `false`.

## `site/data/download-config.json`

- schema version `3.0.0`;
- publishes one same-origin `/downloads/` URL, the pinned GitHub release asset source,
  explicit password-protected access label, version, filename, byte size and SHA-256;
- never contains the archive password, a credential, verifier or private filesystem path;
- `release-uploaded` means GitHub recorded the exact size and digest. `check:dist` verifies
  the same bytes after they are copied into the Pages artifact.

## Public-data rules

Updates require schema/static validation, tests, source review and a new Git commit.
Credentials, tokens, cookies, authorization headers, private network addresses, local
filesystem paths, internal request IDs, internal management endpoints and operator-only
Worker identities are prohibited. The build manifest identifies only the Portal source
revision and its packaged files; it makes no claim about another service's deployment.
The ZIP itself is outside tracked `site/` source. It may enter `dist/` only from the
pinned release asset during the Pages workflow after exact SHA-256 validation.
