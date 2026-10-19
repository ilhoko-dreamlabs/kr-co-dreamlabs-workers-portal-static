import process from "node:process";
import { createDownloadServer, loadConfig } from "./download-server.mjs";

async function main() {
  try {
    const config = await loadConfig(process.env.WORKERS_DOWNLOAD_CONFIG);
    const server = createDownloadServer(config);
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(config.port, config.host, resolve);
    });
    process.stdout.write("WORKERS_DOWNLOAD_READY\n");
  } catch {
    process.stderr.write("WORKERS_DOWNLOAD_STARTUP_FAILED\n");
    process.exitCode = 1;
  }
}

await main();
