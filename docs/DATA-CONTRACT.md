# Portal data contract

`site/data/status.json` is a reviewed public snapshot, not a live Worker API.

Required top-level fields:

- `schemaVersion`: currently `1.0.0`;
- `observedAt`: when the cited operational evidence was observed;
- `publishedAt`: when the snapshot was prepared for publication;
- `staleAfterHours`: age after which the UI must label the snapshot stale;
- `source`: public-safe snapshot ID, evidence class and publication note;
- `workstreams`: planned, designed, developed, validated, released and runtime
  classifications kept separate.

Unknown evidence is represented as unknown or pending. Network/load errors never
become a healthy state. Raw credentials, private endpoints, cookies, authorization
headers, local secret paths and private configuration are prohibited.

Every update requires a public-data review, schema validation, static checks and a
new Git commit. Portal publication does not promote candidate assets or Worker source
to deployed/accepted runtime state.

The public snapshot intentionally does not publish private repository names, private
source revisions, Worker identities, internal hosts, operational ticket IDs or
authentication details. The deploy artifact identifies its own public Portal source
commit through `build-manifest.json`; that commit does not claim to be a Worker runtime
revision.
