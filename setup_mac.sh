#!/bin/bash

echo "🍎 Trading Assistant Mac Setup"
echo "=============================="

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew is installed"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing Node.js..."
    brew install node
else
    echo "✅ Node.js is installed ($(node --version))"
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Installing PostgreSQL..."
    brew install postgresql
    echo "Starting PostgreSQL service..."
    brew services start postgresql
else
    echo "✅ PostgreSQL is installed"
fi

# Start PostgreSQL if not running
if ! brew services list | grep postgresql | grep started > /dev/null 2>&1; then
    echo "Starting PostgreSQL service..."
    brew services start postgresql
    sleep 3
fi

# Create database
echo "Creating trading_assistant_test database..."
createdb trading_assistant_test 2>/dev/null || echo "Database may already exist"

# Navigate to trading-assistant directory
echo "Setting up Trading Assistant backend..."
cd trading-assistant

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Run database migrations
echo "Setting up database schema..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run tests
echo "Running tests..."
npm test

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run the test script: cd trading-assistant && ./test_system_mac.sh"
echo "2. Install Chrome extension from 'chrome-extension' folder"
echo "3. Configure extension with Server URL: http://localhost:4000"
echo ""
echo "To start the server manually:"
echo "  cd trading-assistant"
echo "  npm run dev"
echo ""
echo "To install Chrome extension:"
echo "  1. Open Chrome -> chrome://extensions/"
echo "  2. Enable Developer mode"
echo "  3. Click 'Load unpacked'"
echo "  4. Select the 'chrome-extension' folder"