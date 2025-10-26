# Multi-stage build for production optimization
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.prod.json package.json
COPY package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install Node.js for health checks (optional)
RUN apk add --no-cache nodejs npm

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy custom nginx config for SPA routing
COPY nginx.main.conf /etc/nginx/nginx.conf

# Create a user for better security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S npc -u 1001

# Set permissions
RUN chown -R npc:nodejs /usr/share/nginx/html
RUN chown -R npc:nodejs /var/cache/nginx
RUN chown -R npc:nodejs /var/log/nginx
RUN chown -R npc:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R npc:nodejs /var/run/nginx.pid

# Switch to non-root user
USER npc

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]