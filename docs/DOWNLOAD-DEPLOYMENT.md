# Portable download deployment plan

> Superseded on 2026-10-20. The active Portal download path is the restricted Google
> Drive file recorded in `site/data/download-config.json`. This document is retained
> only as history for the unused key-server candidate and is not an operating plan.

Status: **prepared / endpoint and artifact pending**. This document does not authorize
DNS, proxy, container, key or artifact mutation.

## Selected boundary

The public GitHub Pages Portal remains at `portal.workers.dreamlabs.co.kr`. The download
server is an independent deployable and must not be placed behind the existing
`workers.dreamlabs.co.kr` OAuth gateway or inside a Worker container.

The selected public hostname candidate is `download.workers.dreamlabs.co.kr`, subject
to one owner confirmation and exact GitOps validation. The 2026-10-19 readback shows
that the name currently inherits `*.workers.dreamlabs.co.kr` and resolves to Docker2
public address `121.141.19.98`; there is no exact route or download upstream. Do not
treat that wildcard answer as a deployed download service.

```text
browser native POST
  -> exact HTTPS download host
  -> Apache ingress and centrally managed Workers wildcard TLS on Docker2
  -> exact private SRV53 address:18185
  -> read-only Node container
  -> one read-only private ZIP mount
```

The selected runtime candidate is Node 24.22.0 on Debian bookworm-slim, pinned by the
multi-platform OCI digest in `server/Dockerfile`. SRV53 is selected because the
authoritative host inventory assigns it the application-runtime role; Docker2 remains
the DNS, TLS and reverse-proxy owner. The Linux deployment example uses host networking
and a private configuration whose `listen.host` is the exact SRV53 RFC1918 address and
whose `listen.port` is `18185`. The source rejects wildcard, hostname and public binds.
The SRV53 firewall must admit that port from the exact Docker2 private address only.

TLS does not require a new private key or hostname-specific certificate. Docker2's
centrally managed `workers` certificate already covers `*.workers.dreamlabs.co.kr` and
is renewed through the protected RFC 2136/certbot lifecycle. Acceptance still requires
the served certificate SAN, chain, expiry and fingerprint readback for the new host.

## Private inputs

The following inputs must exist outside this repository and must never be printed in
CI output or copied into Pages artifacts:

- `/run/secrets/download-config.json`: exact Portal origin, SHA-256 key verifiers and
  exactly one active `worker-portable` mapping to the fixed private mount, including
  version, source commit, Windows x64 Preview support, Node version, byte count and
  SHA-256;
- `/srv/private-artifacts/worker-portable.zip`: qualified immutable product ZIP;
- the delivery record for the raw high-entropy key. The server stores only its verifier.

Generate a high-entropy acceptance key before private configuration and hash it locally;
only its SHA-256 verifier is placed in the server config. Keep the raw key in the
protected deployment input so the acceptance job can prove a correct-key download, and
deliver that same raw key to users through an approved private channel only after the
endpoint and artifact pass external acceptance. Adding or removing a key is a private
config update plus a controlled container restart; there is no administrator UI.

## GitOps work after target selection

The review-only GitOps candidate declares the exact route, service, DNS record and
certificate monitor target in the authoritative production infra repository. It stays
`rebuild_planned` with `apply.enabled: false` and cannot restart Apache or SRV53. A
future protected route-controller/apply change must add rollback and smoke gates; do
not hand-edit Apache or change `workers.dreamlabs.co.kr`, other Worker routes,
containers or data.

Required route properties:

- exact FQDN and exact upstream host/port;
- HTTPS termination at the reverse proxy;
- existing central `dreamlabs.ssl.wildcard_workers_dreamlabs_co_kr` certificate;
- request-body logging disabled and access logs free of key/form content;
- POST body size bounded above the server's 4 KiB limit;
- streaming response buffering disabled or qualified for the expected ZIP size;
- timeout sufficient for the supported file size;
- direct upstream and artifact paths unreachable from the public network;
- SRV53 listener bound to its exact private address and port `18185`, with only the
  Docker2 private proxy peer admitted;
- rollback to route absent/server stopped without modifying Portal Pages.

## Activation gates

1. Portable owner supplies immutable ZIP identity, size, SHA-256, supported OS and
   offline manual.
2. Owner confirms the exact tuple `download.workers.dreamlabs.co.kr` + `srv53:18185`
   behind the Docker2 proxy and existing Workers wildcard certificate.
3. Container image is built from the exact Portal commit and recorded by digest.
4. Private config and ZIP mounts pass read-only preflight; no raw key is logged.
5. Correct key downloads exact bytes; wrong key/origin/artifact fail generically.
6. Large-file streaming, cancellation, one-range behavior and proxy timeouts pass.
7. DNS, TLS SAN/chain/expiry, HTTP-to-HTTPS, direct-origin denial and log redaction pass.
8. Only then set `site/data/download-config.json` to the exact HTTPS endpoint and
   published artifact metadata, rebuild Pages and perform desktop/mobile acceptance.

Pages can publish the current `not-published` UI before these gates. It must not be
reported as an active download service.
