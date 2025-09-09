# Stage 1: Build React app
FROM node:18.20.4-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve React build with Nginx
FROM nginx:1.27.2-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy React build
COPY --from=build /app/dist /usr/share/nginx/html

# Expose frontend port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
