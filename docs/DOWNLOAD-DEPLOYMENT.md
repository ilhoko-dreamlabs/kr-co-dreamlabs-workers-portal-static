# Portable download deployment plan

Status: **prepared / endpoint and artifact pending**. This document does not authorize
DNS, proxy, container, key or artifact mutation.

## Selected boundary

The public GitHub Pages Portal remains at `portal.workers.dreamlabs.co.kr`. The download
server is an independent deployable and must not be placed behind the existing
`workers.dreamlabs.co.kr` OAuth gateway or inside a Worker container.

The preferred public hostname candidate is `download.workers.dreamlabs.co.kr`, subject
to owner approval and exact GitOps validation. Existing infrastructure shows
`*.workers.dreamlabs.co.kr` resolving through Docker2, so an exact named route is
required. Do not rely on the wildcard as evidence that the download upstream exists.

```text
browser native POST
  -> exact HTTPS download host
  -> approved reverse proxy on Docker2
  -> loopback 127.0.0.1:4181 on the selected Linux host
  -> read-only Node container
  -> one read-only private ZIP mount
```

The selected runtime candidate is Node 24.13.0 on Debian bookworm-slim, pinned by the
multi-platform OCI digest in `server/Dockerfile`. The Linux deployment example uses
host networking so the non-root process can remain bound to loopback while a proxy on
the same host reaches it. Do not use this compose shape when the proxy is on another
host; choose the actual target and a reviewed private network boundary first.

## Private inputs

The following inputs must exist outside this repository and must never be printed in
CI output or copied into Pages artifacts:

- `/run/secrets/download-config.json`: exact Portal origin, SHA-256 key verifiers and
  one artifact mapping;
- `/srv/private-artifacts/worker-portable.zip`: qualified immutable product ZIP;
- the delivery record for the raw high-entropy key. The server stores only its verifier.

The raw key is generated only after the production endpoint and artifact are accepted.
Deliver it through an approved private channel. Adding or removing a key is a private
config update plus a controlled container restart; there is no administrator UI.

## GitOps work after target selection

Create the exact route, service and DNS record in the authoritative production infra
repository only after the target host is selected. Follow its route-controller policy:
new routes use a controller boundary, central TLS and protected apply with rollback.
Do not hand-edit Apache, reuse wildcard authority, or change `workers.dreamlabs.co.kr`,
other Worker routes, containers or data.

Required route properties:

- exact FQDN and exact upstream host/port;
- HTTPS termination at the reverse proxy;
- request-body logging disabled and access logs free of key/form content;
- POST body size bounded above the server's 4 KiB limit;
- streaming response buffering disabled or qualified for the expected ZIP size;
- timeout sufficient for the supported file size;
- direct upstream and artifact paths unreachable from the public network;
- rollback to route absent/server stopped without modifying Portal Pages.

## Activation gates

1. Portable owner supplies immutable ZIP identity, size, SHA-256, supported OS and
   offline manual.
2. Target host, exact domain and reverse proxy owner are approved.
3. Container image is built from the exact Portal commit and recorded by digest.
4. Private config and ZIP mounts pass read-only preflight; no raw key is logged.
5. Correct key downloads exact bytes; wrong key/origin/artifact fail generically.
6. Large-file streaming, cancellation, one-range behavior and proxy timeouts pass.
7. DNS, TLS SAN/chain/expiry, HTTP-to-HTTPS, direct-origin denial and log redaction pass.
8. Only then set `site/data/download-config.json` to the exact HTTPS endpoint and
   published artifact metadata, rebuild Pages and perform desktop/mobile acceptance.

Pages can publish the current `not-published` UI before these gates. It must not be
reported as an active download service.
