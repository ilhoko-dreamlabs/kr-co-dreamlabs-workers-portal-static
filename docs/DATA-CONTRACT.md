# Portal data contracts

The Portal publishes three JSON documents. All are static source files reviewed before
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

## Public-data rules

Updates require schema/static validation, tests, source review and a new Git commit.
Credentials, tokens, cookies, authorization headers, private network addresses, local
filesystem paths, internal request IDs, internal management endpoints and operator-only
Worker identities are prohibited. The build manifest identifies only the Portal source
revision and its packaged files; it makes no claim about another service's deployment.
