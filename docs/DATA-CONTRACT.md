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

## `site/data/collections.json`

- schema: `schemas/collections.schema.json`, version `2.0.0`;
- groups directory item IDs for Workers, WorkerOps, learning and connected systems;
- every reference must resolve to a published directory item.

## `site/data/portal-status.json`

- schema: `schemas/portal-status.schema.json`, version `2.0.0`;
- records only the catalog review timestamp and the Portal's static-publication boundary;
- `runtimeAuthority` and `liveWorkerData` must remain `false`.

## `site/data/download-config.json`

- schema version `1.0.0`;
- publishes only availability, the public artifact ID/label and, after release, version,
  byte size and SHA-256;
- remains `enabled: false`, with an empty endpoint and `not-published` artifact until
  a real ZIP, separate download server and external HTTPS acceptance exist;
- never contains a key, verifier, private filesystem path or storage origin.

## Public-data rules

Updates require schema/static validation, tests, source review and a new Git commit.
Credentials, tokens, cookies, authorization headers, private network addresses, local
filesystem paths, internal request IDs, internal management endpoints and operator-only
Worker identities are prohibited. The build manifest identifies only the Portal source
revision and its packaged files; it makes no claim about another service's deployment.
The download server's ignored private config is outside this public-data contract and
must not be copied into `site/` or `dist/`.
