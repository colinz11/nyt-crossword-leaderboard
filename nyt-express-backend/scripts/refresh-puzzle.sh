#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")/.."

# Load environment variables from .env file
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Run the compiled script
node dist/scripts/refreshPuzzle.js >> logs/refresh-puzzle.log 2>&1 