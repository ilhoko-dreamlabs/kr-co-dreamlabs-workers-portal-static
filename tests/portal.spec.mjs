import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("portal stays a read-only static projection", async () => {
  const [index, script, snapshot] = await Promise.all([
    read("site/index.html"),
    read("site/js/portal.js"),
    read("site/data/status.json").then(JSON.parse),
  ]);
  assert.match(index, /read-only projection/u);
  assert.match(index, /실시간 Registry 아님/u);
  assert.match(script, /fetch\("\.\/data\/status\.json"/u);
  assert.doesNotMatch(script, /\/api\/|Authorization|WebSocket|EventSource/u);
  assert.equal(snapshot.source.kind, "operator-reviewed-snapshot");
  assert.match(snapshot.source.snapshotId, /^\d{4}-\d{2}-\d{2}-public-v\d+$/u);
  assert.equal(snapshot.source.evidenceClass, "reviewed-private-source");
  assert.equal("revision" in snapshot.source, false);
  assert.equal("repository" in snapshot.source, false);
  assert.ok(snapshot.workstreams.every((item) => item.runtime && item.release));
});

test("candidate assets are not promoted to runtime applied", async () => {
  const lock = JSON.parse(await read("config/asset-lock.json"));
  assert.equal(lock.qualification.approvalStatus, "candidate");
  assert.equal(lock.qualification.runtimeApplied, false);
  assert.ok(lock.assets.every((asset) => asset.path.startsWith("/brand/worker-host/")));
});

test("custom domain remains an explicit pending operation", async () => {
  const [readme, operations] = await Promise.all([read("README.md"), read("docs/OPERATIONS.md")]);
  assert.match(readme, /DNS\/TLS unchanged/u);
  assert.match(operations, /separate read-only DNS\/GitOps inventory/u);
});
