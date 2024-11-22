#!/bin/bash

# Directory containing the React applications
SUBDIRECTORY="../_plugins"

# Directory to move the built applications
DESTINATION="../public/plugins"

# Loop through each subdirectory
for dir in "$SUBDIRECTORY"/*/; do
    if [ -d "$dir" ]; then
        # Get the name of the subdirectory
        APP_NAME=$(basename "$dir")
        
        # Navigate to the subdirectory
        cd "$dir" || exit
        
        # Build the React application
        npm install
        npm run build
        
        # Navigate back to the root directory
        cd - || exit
        
        # Create the destination directory if it doesn't exist
        mkdir -p "$DESTINATION/$APP_NAME"
        
        # Move the built application to the destination directory
        mv "$dir/build/"* "$DESTINATION/$APP_NAME/"
    fi
done