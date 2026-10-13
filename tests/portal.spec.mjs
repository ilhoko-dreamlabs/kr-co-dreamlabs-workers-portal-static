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
  const pages = ["index.html", "workers/index.html", "workerops/index.html", "ecosystem/index.html", "learn/index.html", "about/index.html", "status/index.html"];
  for (const page of pages) {
    const html = await read(`site/${page}`);
    assert.equal((html.match(/<h1\b/gu) || []).length, 1, page);
    assert.match(html, /href="\/css\/portal\.css"/u, page);
    assert.match(html, /src="\/js\/portal\.js"/u, page);
  }
});
