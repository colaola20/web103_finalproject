# Stage 1: Build the Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Backend & Serve
FROM node:20-alpine
WORKDIR /app
# Set environment to production so Express knows to serve the dist folder
ENV NODE_ENV=production

# Copy backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm install --only=production

COPY backend/ ./backend/

# Copy the built frontend from Stage 1 into the location Express expects
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the port your backend runs on (usually 3000)
EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "./bin/www"]