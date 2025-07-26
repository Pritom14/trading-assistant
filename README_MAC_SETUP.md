# 🍎 Trading Assistant - Mac Setup Guide

## Your Directory Structure
```
/Users/pritom/Desktop/trading-assistant/
├── setup_mac.sh                    ← 🎯 Run this first!
├── chrome-extension/               ← Chrome extension files
└── trading-assistant/              ← Backend server (your current location)
    ├── test_system_mac.sh          ← 🧪 Run this second!
    ├── .env                        ← Mac config
    ├── src/
    ├── package.json
    └── ...
```

## 🚀 Quick Setup (3 Commands)

### Step 1: Go to parent directory and run setup
```bash
cd ..  # Go to /Users/pritom/Desktop/trading-assistant/
./setup_mac.sh
```

### Step 2: Test the system
```bash
cd trading-assistant  # Go back to the backend directory
./test_system_mac.sh
```

### Step 3: Install Chrome Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select the `chrome-extension` folder
4. Configure: Server URL: `http://localhost:4000`, User ID: `test-user-123`
5. Click "Connect to Server"

## 📍 File Locations

**From your current location** (`/Users/pritom/Desktop/trading-assistant/trading-assistant/`):

- **Setup script**: `../setup_mac.sh` (in parent directory)
- **Test script**: `./test_system_mac.sh` (in current directory) 
- **Chrome extension**: `../chrome-extension/` (in parent directory)
- **Environment config**: `./.env` (in current directory)

## ✅ What Should Happen

1. **Setup script** installs prerequisites and dependencies
2. **Test script** starts server and tests all endpoints
3. **Chrome extension** connects and shows "Connected" status
4. **Test trades** appear in extension popup
5. **Real-time notifications** work via WebSocket

## 🔧 Manual Commands (if needed)

```bash
# Install PostgreSQL (if not installed)
brew install postgresql
brew services start postgresql

# Create database
createdb trading_assistant_test

# Install dependencies (from trading-assistant directory)
npm install

# Run database setup
npx prisma db push
npx prisma generate

# Run tests
npm test

# Start server
npm run dev
```

## 🐛 Troubleshooting

**If you get "command not found" errors:**
```bash
# Install Homebrew first
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then run setup again
../setup_mac.sh
```

**If PostgreSQL connection fails:**
```bash
brew services restart postgresql
createdb trading_assistant_test
```

**If port 4000 is busy:**
```bash
lsof -ti:4000 | xargs kill -9
```

## 🎉 Success Check

Your system is working if:
- ✅ Setup script completes without errors
- ✅ Test script shows all green checkmarks  
- ✅ Chrome extension shows "Connected"
- ✅ Test trades appear in extension popup
- ✅ Server responds to API calls

---

**Need help?** All the files are created and ready to use! Just follow the 3 steps above.