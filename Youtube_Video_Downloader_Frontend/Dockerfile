# Use Node.js 20 for building the Angular application
FROM node:20 AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --force

# Copy Angular source code and build
COPY . ./
RUN npm run build --prod

# Debugging: List build output to verify
RUN ls -R /app/dist

# Use Nginx to serve the Angular application
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf  
COPY --from=build /app/dist/demo/browser /usr/share/nginx/html

# Expose port for the Angular app
EXPOSE 5000
