FROM node:24.22.0-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5

LABEL org.opencontainers.image.title="DreamLabs Workers Portal download server"
LABEL org.opencontainers.image.source="https://github.com/ilhoko-dreamlabs/kr-co-dreamlabs-workers-portal-static"

WORKDIR /opt/dreamlabs-worker-download
COPY --chown=node:node server/download-server.mjs server/index.mjs ./

ENV NODE_ENV=production
ENV WORKERS_DOWNLOAD_CONFIG=/run/secrets/download-config.json

USER node
EXPOSE 4181
CMD ["node", "index.mjs"]
