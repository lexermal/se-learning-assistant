#!/bin/bash

# Load environment variables from .env file
if [ ! -f .env ]; then
  echo "Error: .env file not found."
  exit 1
fi
 
export $(cat .env | xargs)

# Install dependencies for the main project and plugins
echo "Installing dependencies..."
yarn install --cwd ./
yarn install --cwd ./_plugins/

echo "Dependencies installed."

# ANSI color codes
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Function to start and monitor a server with colored logs
start_server() {
  local dir=$1
  local cmd=$2
  local name=$3
  local color=$4

  while true; do
    echo -e "${color}Starting server [$name] in $dir...${RESET}"
    (
      cd "$dir" || exit
      $cmd 2>&1 | while IFS= read -r line; do
        echo -e "${color}[$name] $line${RESET}"
      done
    )
    echo -e "${YELLOW}Server [$name] in $dir crashed. Restarting in 5 seconds...${RESET}"
    sleep 5
  done
}

# Start development servers with colored logs
start_server "./" "yarn dev" "Main" "$BLUE" &
start_server "./_plugins/rimori-plugin-flashcards" "yarn dev" "Flashcards" "$GREEN" &
# start_server "./_plugins/storytelling" "yarn dev" "Storytelling" "$PURPLE" &
# start_server "./_plugins/rimori-plugin-writing" "yarn dev" "Writing" "$CYAN" &
start_server "./_plugins/shared-components" "yarn dev" "Shared-Components" "$YELLOW" &
start_server "./_plugins/shared-components" "yarn css-dev" "Shared-Components" "$YELLOW" &

echo "All servers are running and being monitored. Logs are displayed below. Press Ctrl+C to stop."

# Wait for all background processes
wait
