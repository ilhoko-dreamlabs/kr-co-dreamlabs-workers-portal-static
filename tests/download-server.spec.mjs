import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createConnection } from "node:net";
import { createDownloadServer, hashDownloadKey, isApprovedListenHost, isPathInside, normalizeConfig } from "../server/download-server.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const portalOrigin = "https://portal.workers.dreamlabs.co.kr";
const artifactId = "worker-portable";
const syntheticKey = "synthetic-local-download-key-20261019";
const fixtureBytes = Buffer.from("PK\u0003\u0004synthetic portable ZIP fixture\n", "utf8");
const fixtureSha256 = "f78bf7f3df50834059506c83d80ba3c6645f36c3c35c4016c51f8f4e52c748d6";

function artifactConfig(artifactPath, overrides = {}) {
  return {
    id: artifactId,
    path: artifactPath,
    filename: "DreamLabs-Worker-2026.10.19-portable-preview.1-win32-x64.zip",
    active: true,
    version: "2026.10.19-portable-preview.1",
    sourceCommit: "a".repeat(40),
    platform: "win32-x64",
    bundledNode: "24.22.0",
    supportStatus: "preview",
    sizeBytes: fixtureBytes.length,
    sha256: fixtureSha256,
    ...overrides,
  };
}

async function startFixtureServer() {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "worker-download-test-"));
  const artifactPath = path.join(temporaryRoot, "fixture.zip");
  await writeFile(artifactPath, fixtureBytes);
  const config = await normalizeConfig({
    listen: { host: "127.0.0.1", port: 4181 },
    publicOrigins: [portalOrigin],
    keyVerifiers: [hashDownloadKey(syntheticKey)],
    artifacts: [artifactConfig(artifactPath)],
  }, { repositoryRoot, expectedArtifactPath: artifactPath });
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
    assert.equal(response.headers.get("content-disposition"), 'attachment; filename="DreamLabs-Worker-2026.10.19-portable-preview.1-win32-x64.zip"');
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

test("configuration rejects repository-hosted artifacts and non-private binds", async () => {
  const base = {
    listen: { host: "127.0.0.1", port: 4181 },
    publicOrigins: [portalOrigin],
    keyVerifiers: [hashDownloadKey(syntheticKey)],
    artifacts: [artifactConfig(path.join(repositoryRoot, "site", "index.html"), { sizeBytes: 1, sha256: "a".repeat(64) })],
  };
  await assert.rejects(() => normalizeConfig(base, { repositoryRoot, expectedArtifactPath: base.artifacts[0].path }), /outside the repository/u);
  for (const host of ["0.0.0.0", "8.8.8.8", "download.workers.dreamlabs.co.kr"]) {
    await assert.rejects(() => normalizeConfig({ ...base, listen: { host, port: 4181 } }, { repositoryRoot, expectedArtifactPath: base.artifacts[0].path }), /loopback or one exact RFC1918/u);
  }
});

test("configuration binds the exact active Windows Preview artifact identity", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "worker-download-contract-"));
  const artifactPath = path.join(temporaryRoot, "fixture.zip");
  await writeFile(artifactPath, fixtureBytes);
  const base = {
    listen: { host: "127.0.0.1", port: 4181 },
    publicOrigins: [portalOrigin],
    keyVerifiers: [hashDownloadKey(syntheticKey)],
    artifacts: [artifactConfig(artifactPath)],
  };
  try {
    const config = await normalizeConfig(base, { repositoryRoot, expectedArtifactPath: artifactPath });
    assert.equal(config.artifacts.get(artifactId).sha256, fixtureSha256);
    for (const overrides of [
      { id: "other" }, { path: path.join(temporaryRoot, "other.zip") }, { active: false },
      { sizeBytes: fixtureBytes.length + 1 }, { sha256: "b".repeat(64) },
      { platform: "linux-x64" }, { supportStatus: "stable" }, { bundledNode: "24.21.0" },
    ]) {
      await assert.rejects(
        () => normalizeConfig({ ...base, artifacts: [artifactConfig(artifactPath, overrides)] }, { repositoryRoot, expectedArtifactPath: artifactPath }),
      );
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("startup failure emits one fixed code without parser content", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "worker-download-startup-"));
  const configPath = path.join(temporaryRoot, "private-config.json");
  const sensitiveMarker = "sensitive-private-config-marker";
  await writeFile(configPath, `{\"${sensitiveMarker}\":`, "utf8");
  try {
    const result = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [path.join(repositoryRoot, "server", "index.mjs")], {
        env: { ...process.env, WORKERS_DOWNLOAD_CONFIG: configPath },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
      child.once("error", reject);
      child.once("close", (code) => resolve({ code, stdout, stderr }));
    });
    assert.equal(result.code, 1);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "WORKERS_DOWNLOAD_STARTUP_FAILED\n");
    assert.doesNotMatch(result.stderr, new RegExp(sensitiveMarker, "u"));
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("listen host allows loopback and exact RFC1918 addresses only", () => {
  for (const host of ["127.0.0.1", "::1", "localhost", "10.20.30.40", "172.16.0.1", "172.31.255.254", "192.168.50.53"]) {
    assert.equal(isApprovedListenHost(host), true, host);
  }
  for (const host of ["0.0.0.0", "::", "172.15.0.1", "172.32.0.1", "169.254.1.1", "1.1.1.1", "srv53"]) {
    assert.equal(isApprovedListenHost(host), false, host);
  }
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
    assert.deepEqual(await health.json(), { status: "ready" });
  } finally {
    await fixture.close();
  }
});
