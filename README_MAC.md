# 🍎 Trading Assistant - Mac Quick Start

## 3-Step Setup

### 1. Setup Everything
```bash
./setup_mac.sh
```

### 2. Test the System
```bash
cd trading-assistant
./test_system_mac.sh
```

### 3. Install Chrome Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select `chrome-extension` folder
4. Configure: Server URL: `http://localhost:4000`, User ID: `test-user-123`
5. Click "Connect to Server"

## ✅ Success Check
- Extension shows "Connected" ✅
- Click "Send Test Trade" → Trade appears ✅
- Go to any website → Click blue "📊 Capture Test Trade" button ✅

## 📖 Full Documentation
- `MAC_SETUP_GUIDE.md` - Complete setup guide
- `TESTING_GUIDE.md` - Comprehensive testing instructions

## 🚀 What This Does
- Captures trades from web browsers automatically
- Processes TradingView alerts
- Real-time WebSocket notifications
- Complete trade management system
- PostgreSQL database storage

## 🛠 Tech Stack
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL
- **Frontend**: Chrome Extension (Vanilla JS)
- **Real-time**: WebSocket
- **Testing**: Jest (28 passing tests)

---
**Need help?** Check `MAC_SETUP_GUIDE.md` for detailed troubleshooting.