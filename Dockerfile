# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build application
COPY . .
RUN npm run build

# Production Stage with lightweight Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default html files
RUN rm -rf ./*

# Copy built static assets from builder
COPY --from=builder /app/dist .

# Copy custom Nginx configuration listening on port 9000
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 9000
EXPOSE 9000

CMD ["nginx", "-g", "daemon off;"]
