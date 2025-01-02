# Stage 1: Build Angular application
FROM node:20 AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --force

# Copy Angular source code and build
COPY . ./
RUN npm run build --prod

# Debugging: List build output to verify
RUN ls -R /app/dist

# Stage 2: Serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy SSL certificates
COPY certs /etc/nginx/certs

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the builder stage
COPY --from=builder /app/dist/demo/browser ./

# Expose ports for HTTP and HTTPS
EXPOSE 443       
EXPOSE 5001      
