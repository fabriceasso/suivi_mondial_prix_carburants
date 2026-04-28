FROM node:20-bullseye-slim

# Create app directory
WORKDIR /usr/src/app/backend

# Install build deps required by better-sqlite3
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential python3 libsqlite3-dev ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy app source
COPY backend/ ./

# Ensure a data directory for persistent SQLite DB
RUN mkdir -p /data && chown node:node /data

# Default DB path can be overridden with DB_PATH env var
ENV DB_PATH=/data/fuel_prices.db
ENV PORT=3001

EXPOSE 3001

USER node
CMD ["node", "server.js"]
