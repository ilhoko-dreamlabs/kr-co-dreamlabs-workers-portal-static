import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createConnection } from "node:net";
import { createDownloadServer, hashDownloadKey, isPathInside, normalizeConfig } from "../server/download-server.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const portalOrigin = "https://portal.workers.dreamlabs.co.kr";
const artifactId = "worker-portable";
const syntheticKey = "synthetic-local-download-key-20261019";
const fixtureBytes = Buffer.from("PK\u0003\u0004synthetic portable ZIP fixture\n", "utf8");

async function startFixtureServer() {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "worker-download-test-"));
  const artifactPath = path.join(temporaryRoot, "fixture.zip");
  await writeFile(artifactPath, fixtureBytes);
  const config = await normalizeConfig({
    listen: { host: "127.0.0.1", port: 4181 },
    publicOrigins: [portalOrigin],
    keyVerifiers: [hashDownloadKey(syntheticKey)],
    artifacts: [{ id: artifactId, path: artifactPath, filename: "dreamlabs-worker-portable.zip" }],
  }, { repositoryRoot });
  const server = createDownloadServer(config);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  return {
    baseUrl,
    close: async () => {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      await rm(temporaryRoot, { recursive: true, force: true });
    },
  };
}

function downloadBody(key = syntheticKey, id = artifactId) {
  return new URLSearchParams({ artifactId: id, key });
}

test("authorized POST streams only the configured ZIP", async () => {
  const fixture = await startFixtureServer();
  try {
    const response = await fetch(`${fixture.baseUrl}/v1/downloads`, {
      method: "POST",
      headers: { Origin: portalOrigin, "Content-Type": "application/x-www-form-urlencoded" },
      body: downloadBody(),
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/zip");
    assert.equal(response.headers.get("content-disposition"), 'attachment; filename="dreamlabs-worker-portable.zip"');
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), fixtureBytes);
  } finally {
    await fixture.close();
  }
});

test("wrong key, origin or artifact receives one generic denial", async () => {
  const fixture = await startFixtureServer();
  try {
    for (const request of [
      { origin: portalOrigin, body: downloadBody("wrong-synthetic-key-value") },
      { origin: "https://untrusted.example", body: downloadBody() },
      { origin: portalOrigin, body: downloadBody(syntheticKey, "not-configured") },
    ]) {
      const response = await fetch(`${fixture.baseUrl}/v1/downloads`, {
        method: "POST",
        headers: { Origin: request.origin, "Content-Type": "application/x-www-form-urlencoded" },
        body: request.body,
      });
      assert.equal(response.status, 403);
      assert.match(response.headers.get("content-type"), /^text\/html/u);
      const body = await response.text();
      assert.match(body, /다운로드 키가 올바르지 않거나/u);
      assert.doesNotMatch(body, /wrong-synthetic-key-value|not-configured|untrusted\.example/u);
    }
  } finally {
    await fixture.close();
  }
});

test("authorized range request streams a bounded segment", async () => {
  const fixture = await startFixtureServer();
  try {
    const response = await fetch(`${fixture.baseUrl}/v1/downloads`, {
      method: "POST",
      headers: {
        Origin: portalOrigin,
        "Content-Type": "application/x-www-form-urlencoded",
        Range: "bytes=4-12",
      },
      body: downloadBody(),
    });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("content-range"), `bytes 4-12/${fixtureBytes.length}`);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), fixtureBytes.subarray(4, 13));
  } finally {
    await fixture.close();
  }
});

test("configuration rejects repository-hosted artifacts and external binds", async () => {
  const base = {
    listen: { host: "127.0.0.1", port: 4181 },
    publicOrigins: [portalOrigin],
    keyVerifiers: [hashDownloadKey(syntheticKey)],
    artifacts: [{ id: artifactId, path: path.join(repositoryRoot, "site", "index.html"), filename: "worker.zip" }],
  };
  await assert.rejects(() => normalizeConfig(base, { repositoryRoot }), /outside the repository/u);
  await assert.rejects(() => normalizeConfig({ ...base, listen: { host: "0.0.0.0", port: 4181 } }, { repositoryRoot }), /loopback binding/u);
});

test("path boundary treats another Windows drive as outside", () => {
  assert.equal(isPathInside("C:\\portal", "C:\\portal\\site\\file.zip", path.win32), true);
  assert.equal(isPathInside("C:\\portal", "D:\\private\\worker.zip", path.win32), false);
  assert.equal(isPathInside("/srv/portal", "/srv/portal/site/file.zip", path.posix), true);
  assert.equal(isPathInside("/srv/portal", "/srv/private/worker.zip", path.posix), false);
});

test("malformed request target is contained by the server boundary", async () => {
  const fixture = await startFixtureServer();
  try {
    const port = Number(new URL(fixture.baseUrl).port);
    const rawResponse = await new Promise((resolve, reject) => {
      const socket = createConnection({ host: "127.0.0.1", port });
      let value = "";
      socket.setEncoding("utf8");
      socket.on("connect", () => socket.end("GET http://[ HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n"));
      socket.on("data", (chunk) => { value += chunk; });
      socket.on("end", () => resolve(value));
      socket.on("error", reject);
    });
    assert.match(rawResponse, /^HTTP\/1\.1 400 /u);
    const health = await fetch(`${fixture.baseUrl}/healthz`);
    assert.equal(health.status, 200);
  } finally {
    await fixture.close();
  }
});
