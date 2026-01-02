FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies first (cached)
COPY package*.json ./

RUN npm install

# Copy everything except node_modules
COPY . .

# Expose NestJS port
EXPOSE 3000

# Start in dev mode with ts-node-dev (hot reload)
CMD ["npm", "run", "start:dev"]
