#!/bin/bash
set -e

# Create dist directory if it doesn't exist
mkdir -p dist

# Install dependencies for the workspace
# echo "Installing workspace dependencies..."
# yarn install

# Build shared-components first
# echo "Building shared-components..."
# cd shared-components
# yarn install
# yarn build
# # yarn link
# cd ..

# Link shared-components in each plugin and build them
for dir in ./*/; do
  if [ -d "$dir" ] && [ -f "${dir}package.json" ]; then
    # Extract the plugin name and r_id
    cd "$dir" || exit
    PLUGIN_NAME=$(basename "$dir" /)
    echo "Processing plugin: $PLUGIN_NAME"
    
    # Link shared-components
    # yarn link "shared-components"
    
    # Get r_id from package.json
    APP_ID=$(node -p "try { require('./package.json').r_id } catch(e) { '' }")
    
    if [ ! -z "$APP_ID" ] && [ "$APP_ID" != "null" ] && [ "$APP_ID" != "undefined" ]; then
      echo "Building plugin $PLUGIN_NAME with ID $APP_ID..."
      
      # Install dependencies and build
      yarn install
      GENERATE_SOURCEMAP=false yarn build
      
      # Create directory for the plugin in dist
      mkdir -p "../dist/$APP_ID"
      
      # Check if dist directory exists in the plugin
      if [ -d "dist" ]; then
        cp -r dist/* "../dist/$APP_ID/"
        echo "Moved build files from dist/ to dist/$APP_ID/"
      # Check if build directory exists (for CRA projects like flashcards)
      elif [ -d "build" ]; then
        cp -r build/* "../dist/$APP_ID/"
        echo "Moved build files from build/ to dist/$APP_ID/"
      else
        echo "Warning: No dist or build directory found for $PLUGIN_NAME"
      fi
    else
      echo "Skipping $PLUGIN_NAME: No r_id found in package.json"
    fi
    
    cd ..
  fi
done

echo "Build process completed successfully!"
