#!/bin/bash

echo "🚀 Trading Assistant System Test"
echo "================================"

# Test 1: Check if PostgreSQL is running
echo "1. Checking PostgreSQL..."
if sudo service postgresql status > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running"
    echo "Starting PostgreSQL..."
    sudo service postgresql start
fi

# Test 2: Check database connection
echo -e "\n2. Checking database connection..."
cd trading-assistant
if npx prisma db push > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
fi

# Test 3: Install dependencies
echo -e "\n3. Installing dependencies..."
if npm install > /dev/null 2>&1; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
fi

# Test 4: Run tests
echo -e "\n4. Running unit tests..."
if npm test > /dev/null 2>&1; then
    echo "✅ All tests passed"
else
    echo "❌ Some tests failed"
fi

# Test 5: Start server in background
echo -e "\n5. Starting server..."
npm run dev > server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Test 6: Test API endpoints
echo -e "\n6. Testing API endpoints..."

# Test TradingView alert
echo "Testing TradingView alert endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:4000/api/tv-alert \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSD",
    "side": "long",
    "entry": 45000,
    "stop": 44000,
    "target": 47000,
    "type": "breakout"
  }')

if echo "$RESPONSE" | grep -q "success"; then
    echo "✅ TradingView alert endpoint working"
else
    echo "❌ TradingView alert endpoint failed"
fi

# Test trade setups endpoint
echo "Testing trade setups endpoint..."
RESPONSE=$(curl -s http://localhost:4000/api/trade-setups)
if [ -n "$RESPONSE" ]; then
    echo "✅ Trade setups endpoint working"
else
    echo "❌ Trade setups endpoint failed"
fi

echo -e "\n🎉 System test completed!"
echo "Server is running on http://localhost:4000"
echo "Server PID: $SERVER_PID"
echo "To stop the server: kill $SERVER_PID"
echo ""
echo "Next steps:"
echo "1. Install the Chrome extension from the 'chrome-extension' folder"
echo "2. Follow the TESTING_GUIDE.md for complete testing instructions"
echo "3. Check server.log for detailed server logs"