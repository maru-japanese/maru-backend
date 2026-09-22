FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY backend ./backend
COPY shared ./shared
COPY scripts/backup.js ./scripts/backup.js
RUN mkdir -p /var/lib/maru && chown -R node:node /var/lib/maru
ENV NODE_ENV=production HOST=0.0.0.0 PORT=5173 MARU_DATA_DIR=/var/lib/maru
USER node
EXPOSE 5173
CMD ["node", "backend/server.js"]
