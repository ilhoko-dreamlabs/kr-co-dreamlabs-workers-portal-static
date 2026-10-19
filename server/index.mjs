import process from "node:process";
import { createDownloadServer, loadConfig } from "./download-server.mjs";

const config = await loadConfig(process.env.WORKERS_DOWNLOAD_CONFIG);
const server = createDownloadServer(config);
server.listen(config.port, config.host, () => {
  console.log(`Worker ZIP download server listening on http://${config.host}:${config.port}`);
});
