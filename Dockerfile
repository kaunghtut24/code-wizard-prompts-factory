
FROM node:18-alpine

# Install Bun
RUN npm install -g bun

WORKDIR /app

COPY package*.json ./
COPY bun.lockb ./

RUN bun install

COPY . .

RUN bun run build:production

CMD [ "bun", "run", "preview", "--", "--host", "0.0.0.0", "--port", "$PORT" ]
