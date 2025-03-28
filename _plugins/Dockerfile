# Stage 1: Build React applications
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Install necessary dependencies for build
RUN apk add --no-cache bash grep

# Copy all files
COPY . .

# Make build script executable
RUN chmod +x build.sh

# Run the build script
RUN ./build.sh

# Stage 2: Create the final image
FROM nginx:alpine

# Copy the built applications from the builder stage to the Nginx directory
COPY --from=builder /app/dist /usr/share/nginx/html/plugins

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
