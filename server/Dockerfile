FROM node:24.13.0-bookworm-slim@sha256:4660b1ca8b28d6d1906fd644abe34b2ed81d15434d26d845ef0aced307cf4b6f

LABEL org.opencontainers.image.title="DreamLabs Workers Portal download server"
LABEL org.opencontainers.image.source="https://github.com/ilhoko-dreamlabs/kr-co-dreamlabs-workers-portal-static"

WORKDIR /opt/dreamlabs-worker-download
COPY --chown=node:node server/download-server.mjs server/index.mjs ./

ENV NODE_ENV=production
ENV WORKERS_DOWNLOAD_CONFIG=/run/secrets/download-config.json

USER node
EXPOSE 4181
CMD ["node", "index.mjs"]
