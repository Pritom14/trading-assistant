# Trading Assistant - Complete Testing Guide

This guide will walk you through testing the entire Trading Assistant system, including the backend API, WebSocket real-time communication, and Chrome extension functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- PostgreSQL running
- Chrome browser
- Trading Assistant backend running

### 1. Start the Backend Server

```bash
cd trading-assistant
npm install
npm start
```

The server should start on `http://localhost:4000`

### 2. Install the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder from this project
5. The Trading Assistant extension should now appear in your extensions

### 3. Configure the Extension

1. Click the Trading Assistant extension icon in Chrome
2. Enter Server URL: `http://localhost:4000`
3. Enter a User ID (any string, e.g., "test-user-123")
4. Click "Connect to Server"
5. Status should change to "Connected"

## 🧪 Testing Scenarios

### Test 1: Basic API Testing

#### Test TradingView Alert Processing
```bash
curl -X POST http://localhost:4000/api/tv-alert \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSD",
    "side": "long",
    "entry": 45000,
    "stop": 44000,
    "target": 47000,
    "type": "breakout"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Alert processed and trade saved"
}
```

#### Test Trade Capture API
```bash
curl -X POST http://localhost:4000/api/trades/log \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "symbol": "BANKNIFTY",
    "entryPrice": 44500,
    "quantity": 50,
    "direction": "BUY",
    "status": "OPEN",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "broker": "API_TEST"
  }'
```

#### Get Trade Setups
```bash
curl http://localhost:4000/api/trade-setups
```

#### Get User Trades
```bash
curl http://localhost:4000/api/trades/user/test-user-123
```

### Test 2: Chrome Extension Testing

#### Method 1: Using Extension Popup
1. Open the extension popup
2. Ensure you're connected to the server
3. Click "Send Test Trade"
4. Check if the trade appears in the "Recent Trades" section
5. Verify the trade was saved by calling the API: `curl http://localhost:4000/api/trades/user/test-user-123`

#### Method 2: Using Content Script
1. Go to any website (e.g., `https://www.google.com`)
2. Look for the blue "📊 Capture Test Trade" button in the bottom-right corner
3. Click the button
4. You should see a success notification
5. Check the extension popup to see the captured trade

#### Method 3: Testing on Trading Platforms
1. Go to `https://kite.zerodha.com` (if you have access)
2. The extension will automatically try to detect trades
3. Or go to `https://tradingview.com`
4. The extension will monitor for alert notifications

### Test 3: WebSocket Real-time Communication

#### Test WebSocket Connection
Open Chrome DevTools Console and run:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:4000');

ws.onopen = () => {
  console.log('Connected to WebSocket');
  // Register with a user ID
  ws.send(JSON.stringify({ userId: 'test-user-123' }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};

// Send a test message
ws.send(JSON.stringify({ userId: 'test-user-123', message: 'Hello' }));
```

#### Test Real-time Trade Notifications
1. Keep the WebSocket connection open (from above)
2. In another terminal, send a TradingView alert:
```bash
curl -X POST http://localhost:4000/api/tv-alert \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETHUSD",
    "side": "short",
    "entry": 3000,
    "stop": 3100,
    "target": 2800,
    "type": "reversal"
  }'
```
3. You should see the trade notification in the WebSocket console

### Test 4: Database Persistence

#### Check Database Contents
```bash
# Connect to PostgreSQL
sudo -u postgres psql -d trading_assistant_test

# View all users
SELECT * FROM "User";

# View all trades
SELECT * FROM "Trade";

# View all user trades
SELECT * FROM "UserTrade";

# Exit PostgreSQL
\q
```

### Test 5: End-to-End Workflow

1. **Start the backend server**
2. **Install and configure the Chrome extension**
3. **Send a TradingView alert** (via curl or Postman)
4. **Verify the trade appears in the extension popup**
5. **Check the database** to ensure data persistence
6. **Test WebSocket notifications** by keeping the extension open while sending alerts

## 🔧 Testing Tools & Scripts

### Automated Test Script

Create a test script to send multiple trades:

```bash
#!/bin/bash
# test_trades.sh

SERVER_URL="http://localhost:4000"
USER_ID="test-user-123"

echo "Testing Trading Assistant API..."

# Test 1: TradingView Alert
echo "1. Testing TradingView Alert..."
curl -X POST $SERVER_URL/api/tv-alert \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSD",
    "side": "long",
    "entry": 45000,
    "stop": 44000,
    "target": 47000,
    "type": "breakout"
  }'

echo -e "\n\n2. Testing Trade Capture..."
curl -X POST $SERVER_URL/api/trades/log \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "symbol": "NIFTY",
    "entryPrice": 19500,
    "quantity": 100,
    "direction": "SELL",
    "status": "CLOSED",
    "exitPrice": 19600,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "broker": "TEST_SCRIPT"
  }'

echo -e "\n\n3. Getting Trade Setups..."
curl $SERVER_URL/api/trade-setups

echo -e "\n\n4. Getting User Trades..."
curl $SERVER_URL/api/trades/user/$USER_ID

echo -e "\n\nTest completed!"
```

Run with: `chmod +x test_trades.sh && ./test_trades.sh`

### Postman Collection

Import this JSON into Postman for easy API testing:

```json
{
  "info": {
    "name": "Trading Assistant API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "TradingView Alert",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"symbol\": \"BTCUSD\",\n  \"side\": \"long\",\n  \"entry\": 45000,\n  \"stop\": 44000,\n  \"target\": 47000,\n  \"type\": \"breakout\"\n}"
        },
        "url": {
          "raw": "http://localhost:4000/api/tv-alert",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4000",
          "path": ["api", "tv-alert"]
        }
      }
    },
    {
      "name": "Capture Trade",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"test-user-123\",\n  \"symbol\": \"BANKNIFTY\",\n  \"entryPrice\": 44500,\n  \"quantity\": 50,\n  \"direction\": \"BUY\",\n  \"status\": \"OPEN\",\n  \"timestamp\": \"{{$isoTimestamp}}\",\n  \"broker\": \"POSTMAN_TEST\"\n}"
        },
        "url": {
          "raw": "http://localhost:4000/api/trades/log",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4000",
          "path": ["api", "trades", "log"]
        }
      }
    },
    {
      "name": "Get Trade Setups",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:4000/api/trade-setups",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4000",
          "path": ["api", "trade-setups"]
        }
      }
    },
    {
      "name": "Get User Trades",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:4000/api/trades/user/test-user-123",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4000",
          "path": ["api", "trades", "user", "test-user-123"]
        }
      }
    }
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Extension not connecting to server**
   - Check if the backend server is running on port 4000
   - Verify the Server URL in the extension popup
   - Check Chrome DevTools console for errors

2. **WebSocket connection failed**
   - Ensure the server is running with WebSocket support
   - Check for firewall blocking the connection
   - Verify the WebSocket URL format (ws:// not http://)

3. **Trades not being captured**
   - Check if the content script is loaded (look for console messages)
   - Verify the user ID is set in the extension
   - Check the background script logs in Chrome DevTools

4. **Database connection issues**
   - Ensure PostgreSQL is running
   - Check the DATABASE_URL in the .env file
   - Run database migrations if needed

### Debug Commands

```bash
# Check if server is running
curl http://localhost:4000/api/trade-setups

# Check database connection
cd trading-assistant && npx prisma studio

# View server logs
cd trading-assistant && npm run dev

# Run tests
cd trading-assistant && npm test
```

## ✅ Success Criteria

Your system is working correctly if:

1. ✅ Backend server starts without errors
2. ✅ All API endpoints respond correctly
3. ✅ Chrome extension connects to the server
4. ✅ WebSocket connection is established
5. ✅ Test trades can be sent and received
6. ✅ Trades are persisted in the database
7. ✅ Real-time notifications work
8. ✅ Extension popup shows recent trades

## 🚀 Next Steps

Once basic testing is complete:

1. **Customize trade capture logic** for specific trading platforms
2. **Add more sophisticated trade detection** algorithms
3. **Implement trade management features** (stop-loss, take-profit)
4. **Add user authentication** and multi-user support
5. **Create a web dashboard** for trade management
6. **Add mobile notifications** for trade alerts
7. **Implement trade analytics** and reporting

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Check Chrome DevTools for extension errors
4. Verify database connectivity and schema