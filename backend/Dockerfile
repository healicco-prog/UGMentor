FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src

RUN npm install -g ts-node

EXPOSE 8080

CMD ["ts-node", "src/server.ts"]
