import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("portal stays a static navigation hub without runtime authority", async () => {
  const [index, script, status] = await Promise.all([
    read("site/index.html"),
    read("site/js/portal.js"),
    read("site/data/portal-status.json").then(JSON.parse),
  ]);
  assert.match(index, /공개 정적 디렉터리/u);
  assert.match(index, /실시간 health/u);
  assert.doesNotMatch(script, /\/api\/|Authorization|WebSocket|EventSource|localStorage|sessionStorage/u);
  assert.equal(status.mode, "public-static-directory");
  assert.equal(status.runtimeAuthority, false);
  assert.equal(status.liveWorkerData, false);
});

test("download UI opens the exact password-protected Portal artifact without handling a password", async () => {
  const [page, script, config] = await Promise.all([
    read("site/download/index.html"),
    read("site/js/portal.js"),
    read("site/data/download-config.json").then(JSON.parse),
  ]);
  assert.equal(config.schemaVersion, "3.0.0");
  assert.equal(config.enabled, true);
  assert.equal(config.provider, "portal-static");
  assert.equal(config.access, "password-protected");
  assert.equal(config.artifact.status, "release-uploaded");
  assert.equal(config.artifact.protection, "zipcrypto");
  assert.equal(config.url, `/downloads/${config.artifact.filename}`);
  assert.match(config.source.assetUrl, /^https:\/\/github\.com\/.*\/releases\/download\//u);
  assert.match(page, /data-download-link/u);
  assert.match(page, /압축 암호/u);
  assert.match(page, /data-download-sha256/u);
  assert.doesNotMatch(page, /name="key"|type="password"|method="post"/iu);
  assert.doesNotMatch(script, /keyInput|artifactInput|formData|localStorage|sessionStorage|\/v1\/downloads/iu);
});

test("directory publishes eight role Workers and omits privileged operations", async () => {
  const directory = JSON.parse(await read("site/data/directory.json"));
  const workers = directory.items.filter((item) => item.kind === "worker");
  assert.equal(workers.length, 8);
  assert.ok(workers.every((item) => item.exposure === "public-listable"));
  assert.ok(workers.every((item) => item.access !== "public"));
  assert.doesNotMatch(JSON.stringify(directory), /worker00|req-[a-f0-9]{16,}|Authorization/iu);
});

test("HR remains a connected business system outside WorkerOps runtime", async () => {
  const [directory, ecosystem, workerops] = await Promise.all([
    read("site/data/directory.json").then(JSON.parse),
    read("site/ecosystem/index.html"),
    read("site/workerops/index.html"),
  ]);
  const hr = directory.items.find((item) => item.id === "hr-system");
  assert.equal(hr.kind, "business-system");
  assert.match(ecosystem, /별도 업무 시스템/u);
  assert.match(workerops, /Worker runtime 또는 WorkerOps 제어 소유권/u);
});

test("reviewed Worker Host use cases are published without runtime claims", async () => {
  const [directory, collections, learn] = await Promise.all([
    read("site/data/directory.json").then(JSON.parse),
    read("site/data/collections.json").then(JSON.parse),
    read("site/learn/index.html"),
  ]);
  const collection = collections.collections.find((item) => item.id === "worker-host-use-cases");
  assert.equal(collection.itemIds.length, 5);
  assert.ok(collection.itemIds.every((id) => directory.items.some((item) => item.id === id && item.kind === "explanation")));
  assert.match(learn, /판매·수익성 분석/u);
  assert.match(learn, /작은 개발팀/u);
  assert.doesNotMatch(learn, /candidate-202610/u);
});

test("portal uses only the approved tracked Asset Pack runtime asset", async () => {
  const [lock, css, index] = await Promise.all([
    read("config/asset-lock.json").then(JSON.parse),
    read("site/css/portal.css"),
    read("site/index.html"),
  ]);
  assert.equal(lock.reference.site, "https://assets.dreamlabs.co.kr/");
  assert.equal(lock.reference.manifestVersion, "0.1.2");
  assert.equal(lock.reference.catalogStatus, "candidate-inspection");
  assert.equal(lock.reference.approvalStatus, "mixed");
  assert.equal(lock.packaging.mode, "hybrid");
  assert.equal(lock.packaging.runtimeHotlink, true);
  assert.ok(lock.assets.some((asset) => asset.sourceApprovalStatus === "approved" && asset.portalRuntimeApplied === true));
  assert.match(css, /--accent:\s*#2457c5/u);
  assert.match(index, /https:\/\/assets\.dreamlabs\.co\.kr\/agents\/dreamlabs-worker\/icon\/dreamlabs-bot-icon\.png/u);
  assert.doesNotMatch(index, /assets\.workers\.dreamlabs\.co\.kr/u);
});

test("public routes and schema identifiers use the accepted custom domain", async () => {
  const [readme, operations, directorySchema, collectionsSchema, statusSchema] = await Promise.all([
    read("README.md"),
    read("docs/OPERATIONS.md"),
    read("schemas/directory.schema.json").then(JSON.parse),
    read("schemas/collections.schema.json").then(JSON.parse),
    read("schemas/portal-status.schema.json").then(JSON.parse),
  ]);
  assert.match(readme, /https:\/\/portal\.workers\.dreamlabs\.co\.kr\//u);
  assert.match(readme, /workers\.dreamlabs\.co\.kr.*별도 인증 서비스/u);
  assert.match(operations, /portal\.workers\.dreamlabs\.co\.kr/u);
  for (const schema of [directorySchema, collectionsSchema, statusSchema]) {
    assert.match(schema.$id, /^https:\/\/portal\.workers\.dreamlabs\.co\.kr\/schemas\//u);
  }
});

test("every navigable page has one h1 and packaged browser assets", async () => {
  const pages = ["index.html", "workers/index.html", "workerops/index.html", "ecosystem/index.html", "learn/index.html", "download/index.html", "about/index.html", "status/index.html"];
  for (const page of pages) {
    const html = await read(`site/${page}`);
    assert.equal((html.match(/<h1\b/gu) || []).length, 1, page);
    assert.match(html, /href="\/css\/portal\.css"/u, page);
    assert.match(html, /src="\/js\/portal\.js"/u, page);
  }
});

test("preserved legacy download container source remains pinned and excluded from Pages", async () => {
  const [dockerfile, dockerignore, compose, workflow] = await Promise.all([
    read("server/Dockerfile"),
    read(".dockerignore"),
    read("server/compose.example.yml"),
    read(".github/workflows/download-image.yml"),
  ]);
  assert.match(dockerfile, /^FROM node:24\.22\.0-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5$/mu);
  assert.match(dockerfile, /USER node/u);
  assert.doesNotMatch(dockerfile, /config\.local|private-artifacts|\.zip/u);
  assert.match(dockerignore, /\*\*/u);
  assert.match(compose, /read_only: true/u);
  assert.match(compose, /network_mode: host/u);
  assert.match(compose, /no-new-privileges:true/u);
  assert.doesNotMatch(compose, /keyVerifiers|download-key/u);
  assert.match(workflow, /workflow_dispatch:/u);
  assert.doesNotMatch(workflow, /^\s+push:/mu);
  assert.match(workflow, /packages: write/u);
  assert.match(workflow, /git merge-base --is-ancestor/u);
  assert.match(workflow, /docker push/u);
  assert.doesNotMatch(workflow, /:latest\b/u);
});

test("Pages workflow stages and verifies the exact password-protected release asset", async () => {
  const [workflow, config] = await Promise.all([
    read(".github/workflows/pages.yml"),
    read("site/data/download-config.json").then(JSON.parse),
  ]);
  assert.match(workflow, new RegExp(config.source.releaseTag.replaceAll(".", "\\."), "u"));
  assert.match(workflow, new RegExp(config.artifact.filename.replaceAll(".", "\\."), "u"));
  assert.match(workflow, new RegExp(config.artifact.sha256, "u"));
  assert.match(workflow, /sha256sum --check/u);
});
