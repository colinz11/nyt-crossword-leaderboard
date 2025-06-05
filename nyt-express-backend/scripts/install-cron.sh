#!/bin/bash

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Replace placeholder path with actual path in crontab file
sed "s|/path/to/nyt-crossword-leaderboard|$(dirname "$PROJECT_DIR")|" "$PROJECT_DIR/scripts/crontab" > "$PROJECT_DIR/scripts/crontab.tmp"

# Install the cron job
if crontab -l | grep -q "refresh-puzzle.sh"; then
    echo "Cron job already exists. Updating..."
    (crontab -l | grep -v "refresh-puzzle.sh"; cat "$PROJECT_DIR/scripts/crontab.tmp") | crontab -
else
    echo "Installing new cron job..."
    (crontab -l 2>/dev/null; cat "$PROJECT_DIR/scripts/crontab.tmp") | crontab -
fi

# Clean up temporary file
rm "$PROJECT_DIR/scripts/crontab.tmp"

echo "Cron job installed successfully!"
echo "The puzzle refresh will run daily at 5 AM UTC"
echo "Logs will be written to: $PROJECT_DIR/logs/refresh-puzzle.log" 