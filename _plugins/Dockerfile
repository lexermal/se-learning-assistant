# Stage 1: Build React applications
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files
COPY package.json yarn.lock ./

# Copy all plugins
COPY . ./

# Install dependencies
RUN yarn install

# Build each React application
RUN for dir in ./*/; do \
    if [ -d "$dir" ] && [ "$(basename \"$dir\")" != "node_modules" ]; then \
        APP_NAME=$(basename "$dir"); \
        cd "$dir" || exit; \
        export GENERATE_SOURCEMAP=false; \
        yarn run build; \
        cd - || exit; \
        if [ "$APP_NAME" != "shared-components" ]; then \
            mkdir -p "dist/$APP_NAME"; \
            mv "$dir"build/* "dist/$APP_NAME/"; \
        fi; \
    fi; \
done

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
