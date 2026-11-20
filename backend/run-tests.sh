#!/bin/bash
# MoodBeats Backend Test Runner

set -e

echo "=========================================="
echo "MoodBeats Backend Tests"
echo "=========================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "❌ Error: Backend server is not running"
    echo "   Please start the server first:"
    echo "   npm run dev"
    echo ""
    exit 1
fi

echo "✓ Backend server is running"
echo ""

# Check database connection
HEALTH=$(curl -s http://localhost:3001/api/health)
DB_CONNECTED=$(echo "$HEALTH" | grep -o '"connected":[^,}]*' | cut -d':' -f2)

if [ "$DB_CONNECTED" != "true" ]; then
    echo "⚠ Warning: Database is not connected"
    echo "   Some tests may fail"
    echo "   Please ensure database is set up (see SETUP_INSTRUCTIONS.md)"
    echo ""
fi

echo "Running tests..."
echo ""

# Run tests
npm test

echo ""
echo "=========================================="
echo "Tests Complete"
echo "=========================================="
