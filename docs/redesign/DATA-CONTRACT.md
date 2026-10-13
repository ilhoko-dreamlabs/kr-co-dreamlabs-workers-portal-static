# Proposed Portal directory contract

Version 2 replaces the workstream snapshot as the primary home-page data with a
curated directory. Portal delivery facts may remain on `/status/`, but they are
not mixed with Worker links.

## Source files

```text
site/data/
├─ directory.json          public destinations and selected deep links
├─ collections.json        home-page and learn-page groupings
└─ portal-status.json       Portal artifact/link review facts only
```

Everything in these files is public. Authentication cannot be added by hiding
fields in JavaScript.

## Directory item

```json
{
  "id": "worker-host",
  "kind": "product",
  "title": "Worker Host",
  "summary": "역할별 Worker 실행 기반과 전체 구조를 소개합니다.",
  "url": "https://worker-host.dreamlabs.co.kr/",
  "audiences": ["user", "operator", "developer"],
  "tags": ["product", "architecture"],
  "access": "public",
  "exposure": "public-listable",
  "availability": "https-observed",
  "linkReview": {
    "observedAt": "2026-10-13T00:00:00+09:00",
    "expected": "http-200",
    "source": "reviewed-route-and-https"
  },
  "actions": [
    { "label": "소개 보기", "url": "https://worker-host.dreamlabs.co.kr/" }
  ]
}
```

## Enumerations

| Field | Values |
|---|---|
| `kind` | `worker`, `product`, `service`, `business-system`, `guide`, `standard`, `explanation` |
| `access` | `public`, `login-required`, `access-controlled`, `restricted` |
| `exposure` | `public-listable`, `authenticated-directory-only`, `not-published` |
| `availability` | `https-observed`, `manifest-backed`, `candidate-only`, `unavailable` |

These axes remain separate. For example, a Worker may be
`login-required` and `https-observed`; that is not an error and does not say the
Worker runtime is healthy.

## Required fields

- stable `id` with no hostname-derived secrets;
- `kind`, `title` and a plain-language `summary`;
- absolute HTTPS `url` for clickable items;
- at least one audience and tag;
- explicit `access`, `exposure` and `availability`;
- reviewed observation time and evidence class;
- one or more actions whose URLs are allowlisted.

## Prohibited fields and values

- internal IPs, ports, container/host names and private routes;
- health, readiness or administrative API paths;
- source tokens, cookies, headers, OAuth client secrets or credential metadata;
- live task, session, usage, image or worker state;
- private repository or protected pipeline identifiers;
- `restricted` items with a URL in the deploy artifact;
- HTML descriptions or executable snippets.

## Build validation

The validator must fail when:

- a URL is not HTTPS or its host is outside the approved host allowlist;
- an item is clickable while `exposure` is not `public-listable`;
- a restricted item contains a URL;
- duplicate IDs or actions exist;
- review time, access label, title or summary is missing;
- link review is older than the configured release threshold;
- raw internal address patterns or credential-like strings are present;
- an action points to a candidate-only route without an explicit candidate
  badge and owner approval.

## Link checking

Release validation uses a server-side script or CI job, never browser runtime
JavaScript. Expected outcomes are per item:

- public documents: 200;
- native application login: 200 or documented 302;
- OAuth protected Worker: documented 302/401/403 or authenticated landing;
- anchors: base document 200 plus source/DOM anchor verification where the
  project is available.

The build records result class and timestamp, not response bodies, cookies or
authorization data. A network error is `unavailable`, never `healthy`.

## Portal status

`portal-status.json` may identify the Portal source commit, artifact manifest,
publication time and link-catalog review time. It must not become a projection
of Worker runtime state. The v1 workstream model is retired from the home page
and preserved only in Git history or an explicitly labelled archive.
