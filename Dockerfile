# ==============================================================================
# TruthBot Multi-Stage Dockerfile (AWS ECS / App Runner Ready)
# ==============================================================================

# Stage 1: Build the React/Vite Frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built frontend assets to the server's public folder
COPY --from=builder /app/dist ./server/public

# Copy backend server code
COPY server ./server

# Environment variables will be injected at runtime by AWS
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the Node.js backend
CMD ["node", "server/server.js"]
