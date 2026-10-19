import { createHash, timingSafeEqual } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { isIP } from "node:net";
import path from "node:path";

const MAX_BODY_BYTES = 4096;
const ZIP_TYPE = "application/zip";
export const PRODUCTION_ARTIFACT_PATH = "/srv/private-artifacts/worker-portable.zip";
export const PORTABLE_ARTIFACT_ID = "worker-portable";
export const PORTABLE_PLATFORM = "win32-x64";
export const PORTABLE_SUPPORT_STATUS = "preview";

export function hashDownloadKey(value) {
  if (typeof value !== "string" || value.length < 16 || value.length > 512) return null;
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function matchesVerifier(digest, verifier) {
  if (!digest || !/^[a-f0-9]{64}$/u.test(verifier)) return false;
  return timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(verifier, "hex"));
}

export function isPathInside(parent, candidate, pathApi = path) {
  const relative = pathApi.relative(parent, candidate);
  return relative === "" || (!pathApi.isAbsolute(relative) && !relative.startsWith(`..${pathApi.sep}`) && relative !== "..");
}

export function isApprovedListenHost(host) {
  if (host === "127.0.0.1" || host === "::1" || host === "localhost") return true;
  if (isIP(host) !== 4) return false;
  const [first, second] = host.split(".").map(Number);
  return first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
}

function safeFilename(value) {
  const candidate = path.basename(String(value || "worker-portable.zip"));
  return candidate.replace(/[^A-Za-z0-9._-]/gu, "-") || "worker-portable.zip";
}

async function hashFile(filePath) {
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.once("error", reject);
    stream.once("end", resolve);
  });
  return hash.digest("hex");
}

function json(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...extraHeaders,
  });
  response.end(`${JSON.stringify(body)}\n`);
}

function downloadError(response, status, message, extraHeaders = {}) {
  const body = `<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>다운로드 안내</title><style>body{margin:0;background:#f6f8fb;color:#1c2430;font:16px/1.6 system-ui,sans-serif}main{width:min(560px,calc(100% - 40px));margin:12vh auto;padding:32px;border:1px solid #d9e0ea;border-radius:16px;background:#fff}p{color:#667085}a{color:#1748a6;font-weight:700}</style></head><body><main><h1>다운로드할 수 없습니다</h1><p>${message}</p><a href="https://portal.workers.dreamlabs.co.kr/download/">다운로드 페이지로 돌아가기</a></main></body></html>`;
  response.writeHead(status, {
    "content-type": "text/html; charset=utf-8",
    "content-length": String(Buffer.byteLength(body)),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    ...extraHeaders,
  });
  response.end(body);
}

async function readForm(request) {
  const contentType = String(request.headers["content-type"] || "").split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/x-www-form-urlencoded") {
    const error = new Error("unsupported content type");
    error.statusCode = 415;
    throw error;
  }

  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      const error = new Error("request body too large");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

function parseRange(value, size) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/u.exec(value);
  if (!match || (!match[1] && !match[2])) return false;
  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return false;
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) return false;
    end = Math.min(end, size - 1);
  }
  return { start, end };
}

export async function normalizeConfig(input, options = {}) {
  const repositoryRoot = path.resolve(options.repositoryRoot || path.resolve(import.meta.dirname, ".."));
  const expectedArtifactPath = path.resolve(options.expectedArtifactPath || PRODUCTION_ARTIFACT_PATH);
  const host = input?.listen?.host || "127.0.0.1";
  const port = Number(input?.listen?.port || 4181);
  if (!isApprovedListenHost(host)) {
    throw new Error("listen.host must be loopback or one exact RFC1918 address behind an approved reverse proxy");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("listen.port must be a valid TCP port");

  const publicOrigins = [...new Set(input?.publicOrigins || [])];
  if (!publicOrigins.length || publicOrigins.some((origin) => {
    try {
      const parsed = new URL(origin);
      return parsed.origin !== origin || parsed.protocol !== "https:";
    } catch {
      return true;
    }
  })) throw new Error("publicOrigins must contain exact HTTPS origins");

  const keyVerifiers = [...new Set(input?.keyVerifiers || [])];
  if (!keyVerifiers.length || keyVerifiers.some((value) => !/^[a-f0-9]{64}$/u.test(value))) {
    throw new Error("keyVerifiers must contain lowercase SHA-256 digests");
  }

  if (!Array.isArray(input?.artifacts) || input.artifacts.length !== 1) throw new Error("Exactly one private artifact is required");
  const ids = new Set();
  const artifacts = new Map();
  for (const artifact of input.artifacts) {
    if (typeof artifact.id !== "string" || !/^[a-z0-9][a-z0-9._-]*$/u.test(artifact.id) || ids.has(artifact.id)) {
      throw new Error(`Invalid or duplicate artifact id: ${artifact.id}`);
    }
    ids.add(artifact.id);
    if (artifact.id !== PORTABLE_ARTIFACT_ID) throw new Error("The configured artifact id is not the Portable contract");
    if (!path.isAbsolute(artifact.path)) throw new Error(`${artifact.id}: artifact path must be absolute`);
    if (path.resolve(artifact.path) !== expectedArtifactPath) throw new Error(`${artifact.id}: artifact path differs from the approved private mount`);
    if (artifact.active !== true) throw new Error(`${artifact.id}: artifact must be explicitly active`);
    if (!Number.isSafeInteger(artifact.sizeBytes) || artifact.sizeBytes < 1) throw new Error(`${artifact.id}: sizeBytes must be a positive integer`);
    if (!/^[a-f0-9]{64}$/u.test(artifact.sha256 || "")) throw new Error(`${artifact.id}: sha256 must be one lowercase digest`);
    if (artifact.platform !== PORTABLE_PLATFORM || artifact.supportStatus !== PORTABLE_SUPPORT_STATUS) {
      throw new Error(`${artifact.id}: artifact must declare the Windows x64 Preview contract`);
    }
    if (typeof artifact.version !== "string" || !/^\d{4}\.\d{2}\.\d{2}-portable-preview\.\d+$/u.test(artifact.version)) {
      throw new Error(`${artifact.id}: version must identify one Portable Preview release`);
    }
    if (!/^[a-f0-9]{40}$/u.test(artifact.sourceCommit || "")) throw new Error(`${artifact.id}: sourceCommit must identify one exact source commit`);
    if (artifact.bundledNode !== "24.22.0") throw new Error(`${artifact.id}: bundledNode differs from the approved runtime`);
    const resolved = await realpath(artifact.path);
    if (isPathInside(repositoryRoot, resolved)) throw new Error(`${artifact.id}: private artifact must be outside the repository`);
    const info = await stat(resolved);
    if (!info.isFile() || info.size !== artifact.sizeBytes) throw new Error(`${artifact.id}: artifact size differs from the configured identity`);
    if (await hashFile(resolved) !== artifact.sha256) throw new Error(`${artifact.id}: artifact digest differs from the configured identity`);
    artifacts.set(artifact.id, {
      id: artifact.id,
      path: resolved,
      filename: safeFilename(artifact.filename),
      size: info.size,
      sha256: artifact.sha256,
      version: artifact.version,
      sourceCommit: artifact.sourceCommit,
      platform: artifact.platform,
      supportStatus: artifact.supportStatus,
    });
  }

  return { host, port, publicOrigins: new Set(publicOrigins), keyVerifiers, artifacts };
}

export async function loadConfig(configPath, options = {}) {
  if (!configPath) throw new Error("WORKERS_DOWNLOAD_CONFIG must identify a private server configuration file");
  return normalizeConfig(JSON.parse(await readFile(path.resolve(configPath), "utf8")), options);
}

async function handleRequest(config, request, response) {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    if (request.method === "GET" && url.pathname === "/healthz") {
      json(response, 200, { status: "ready" });
      return;
    }
    if (request.method !== "POST" || url.pathname !== "/v1/downloads") {
      json(response, 404, { error: "not_found" });
      return;
    }

    const origin = String(request.headers.origin || "");
    if (!config.publicOrigins.has(origin)) {
      downloadError(response, 403, "다운로드 키가 올바르지 않거나 이 요청을 허용할 수 없습니다. 키를 다시 확인해 주세요.");
      return;
    }

    try {
      const form = await readForm(request);
      const digest = hashDownloadKey(form.get("key"));
      const authorized = config.keyVerifiers.reduce((matched, verifier) => matchesVerifier(digest, verifier) || matched, false);
      const artifact = config.artifacts.get(form.get("artifactId"));
      if (!authorized || !artifact) {
        downloadError(response, 403, "다운로드 키가 올바르지 않거나 이 요청을 허용할 수 없습니다. 키를 다시 확인해 주세요.");
        return;
      }

      const info = await stat(artifact.path);
      if (!info.isFile() || info.size !== artifact.size) {
        downloadError(response, 503, "파일이 아직 준비되지 않았습니다. 잠시 후 다시 시도하거나 운영 담당자에게 문의해 주세요.");
        return;
      }

      const range = parseRange(request.headers.range, info.size);
      if (range === false) {
        downloadError(response, 416, "요청한 파일 범위를 처리할 수 없습니다. 새 다운로드로 다시 시도해 주세요.", { "content-range": `bytes */${info.size}` });
        return;
      }
      const start = range?.start ?? 0;
      const end = range?.end ?? info.size - 1;
      const status = range ? 206 : 200;
      const headers = {
        "content-type": ZIP_TYPE,
        "content-length": String(end - start + 1),
        "content-disposition": `attachment; filename="${artifact.filename}"`,
        "cache-control": "no-store",
        "accept-ranges": "bytes",
        "x-content-type-options": "nosniff",
        "referrer-policy": "no-referrer",
      };
      if (range) headers["content-range"] = `bytes ${start}-${end}/${info.size}`;
      response.writeHead(status, headers);
      const stream = createReadStream(artifact.path, { start, end });
      response.on("close", () => stream.destroy());
      stream.on("error", () => response.destroy());
      stream.pipe(response);
    } catch (error) {
      downloadError(response, Number(error.statusCode) || 400, "요청 형식을 처리할 수 없습니다. 다운로드 페이지에서 다시 시도해 주세요.");
    }
}

export function createDownloadServer(config) {
  return createServer((request, response) => {
    handleRequest(config, request, response).catch(() => {
      if (response.headersSent) response.destroy();
      else downloadError(response, 400, "요청 형식을 처리할 수 없습니다. 다운로드 페이지에서 다시 시도해 주세요.");
    });
  });
}
