# 🍎 Trading Assistant - Mac Setup Guide

This guide will help you set up and test the Trading Assistant system on macOS.

## 🚀 Quick Start (3 Steps)

### Step 1: Run the Setup Script
```bash
./setup_mac.sh
```

This will automatically:
- ✅ Install Homebrew (if needed)
- ✅ Install Node.js (if needed)
- ✅ Install PostgreSQL (if needed)
- ✅ Create the test database
- ✅ Install all dependencies
- ✅ Run database migrations
- ✅ Run all tests

### Step 2: Test the System
```bash
cd trading-assistant
./test_system_mac.sh
```

This will:
- ✅ Start the backend server
- ✅ Test all API endpoints
- ✅ Verify database connectivity
- ✅ Show you next steps

### Step 3: Install Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Configure with Server URL: `http://localhost:4000`
6. Enter User ID: `test-user-123`
7. Click "Connect to Server"

## 📁 Your Directory Structure

Your Mac setup should look like this:
```
trading-assistant/                 ← Your current directory
├── setup_mac.sh                 ← 🎯 Run this first!
├── MAC_SETUP_GUIDE.md           ← 📖 This guide
├── chrome-extension/            ← 🌐 Chrome extension
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── background.js
│   └── content.js
└── trading-assistant/           ← 🚀 Backend server
    ├── test_system_mac.sh       ← 🧪 Run this second!
    ├── .env                     ← ⚙️ Mac-compatible config
    ├── src/
    ├── package.json
    └── ...
```

## 🧪 Testing Scenarios

### Test 1: Backend API Testing
```bash
# Test TradingView alert
curl -X POST http://localhost:4000/api/tv-alert \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "side": "long",
    "entry": 150,
    "stop": 145,
    "target": 160,
    "type": "breakout"
  }'

# Get trade setups
curl http://localhost:4000/api/trade-setups

# Get user trades
curl http://localhost:4000/api/trades/user/test-user-123
```

### Test 2: Chrome Extension Testing

#### Method 1: Extension Popup
1. Click the Trading Assistant extension icon
2. Ensure "Connected" status
3. Click "Send Test Trade"
4. Trade should appear in "Recent Trades"

#### Method 2: Content Script
1. Go to any website (e.g., google.com)
2. Look for blue "📊 Capture Test Trade" button (bottom-right)
3. Click button → should see green success notification
4. Check extension popup for the captured trade

#### Method 3: Real-time WebSocket
1. Keep extension popup open
2. Send API request (from Test 1 above)
3. Trade should instantly appear in extension!

### Test 3: Database Verification
```bash
# Connect to database
psql trading_assistant_test

# Check data
SELECT * FROM "Trade";
SELECT * FROM "UserTrade";

# Exit
\q
```

## 🔧 Mac-Specific Commands

### PostgreSQL Management
```bash
# Start PostgreSQL
brew services start postgresql

# Stop PostgreSQL
brew services stop postgresql

# Check status
brew services list | grep postgresql

# Connect to database
psql trading_assistant_test
```

### Server Management
```bash
# Start development server
cd trading-assistant
npm run dev

# Run tests
npm test

# Check if server is running
curl http://localhost:4000/api/trade-setups

# Kill server process (if needed)
pkill -f "npm run dev"
```

## 🐛 Troubleshooting

### Common Mac Issues

1. **"brew: command not found"**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **PostgreSQL connection failed**
   ```bash
   brew services restart postgresql
   createdb trading_assistant_test
   ```

3. **Port 4000 already in use**
   ```bash
   lsof -ti:4000 | xargs kill -9
   ```

4. **Extension not loading**
   - Check Chrome Developer mode is enabled
   - Try reloading the extension
   - Check Chrome DevTools for errors

5. **Database permission issues**
   ```bash
   # Fix PostgreSQL permissions
   sudo chown -R $(whoami) /usr/local/var/postgres
   ```

## ✅ Success Checklist

Your system is working if:

- [ ] ✅ `./setup_mac.sh` completes without errors
- [ ] ✅ `./test_system_mac.sh` shows all green checkmarks
- [ ] ✅ Chrome extension shows "Connected" status
- [ ] ✅ Test trades appear in extension popup
- [ ] ✅ API endpoints respond correctly
- [ ] ✅ Database contains trade data
- [ ] ✅ Real-time notifications work

## 🚀 Advanced Testing

### WebSocket Testing in Chrome Console
```javascript
const ws = new WebSocket('ws://localhost:4000');
ws.onopen = () => {
  console.log('Connected!');
  ws.send(JSON.stringify({ userId: 'test-user-123' }));
};
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

### Automated Testing Script
```bash
#!/bin/bash
# automated_test.sh

echo "Running automated tests..."

# Test multiple alerts
for i in {1..5}; do
  curl -X POST http://localhost:4000/api/tv-alert \
    -H "Content-Type: application/json" \
    -d "{
      \"symbol\": \"STOCK$i\",
      \"side\": \"long\",
      \"entry\": $((100 + i * 10)),
      \"stop\": $((95 + i * 10)),
      \"target\": $((110 + i * 10)),
      \"type\": \"breakout\"
    }"
  echo "Sent trade $i"
  sleep 1
done

echo "Check your extension - you should see 5 new trades!"
```

## 📱 Next Steps

Once everything is working:

1. **Customize for your trading platforms**
   - Modify `content.js` for specific broker websites
   - Add more sophisticated trade detection

2. **Deploy to production**
   - Deploy backend to Heroku/AWS
   - Update extension with production URL
   - Publish to Chrome Web Store

3. **Add features**
   - User authentication
   - Trade management dashboard
   - Mobile notifications
   - Analytics and reporting

## 📞 Support

If you encounter issues:

1. **Check the logs**
   ```bash
   # Server logs
   tail -f trading-assistant/server.log
   
   # Chrome extension logs
   # Open Chrome DevTools → Extensions → Trading Assistant → Inspect views
   ```

2. **Verify prerequisites**
   ```bash
   node --version    # Should be v16+
   npm --version     # Should be v8+
   psql --version    # Should be v12+
   ```

3. **Reset everything**
   ```bash
   # Stop all processes
   pkill -f "npm run dev"
   
   # Drop and recreate database
   dropdb trading_assistant_test
   createdb trading_assistant_test
   
   # Restart from setup
   ./setup_mac.sh
   ```

---

🎉 **You're all set!** Your Trading Assistant system should now be fully functional on macOS.