FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
RUN apk upgrade --no-cache && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
           /opt/yarn-v1.22.22
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
EXPOSE 3004
USER node
CMD ["node", "src/server.js"]
