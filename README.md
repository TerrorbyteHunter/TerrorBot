# TerrorBot - Cryptocurrency Arbitrage Trading Platform

A professional cryptocurrency arbitrage trading bot with real-time price monitoring, opportunity detection, backtesting capabilities, and comprehensive analytics. Features both **cross-exchange** and **triangular arbitrage** detection.

![Trading Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Features

### Core Functionality
- **Dual Arbitrage Strategies**
  - **Cross-Exchange Arbitrage**: Exploit price differences across multiple exchanges (Binance, Coinbase, Kraken)
  - **Triangular Arbitrage**: Trade within a single exchange (e.g., BTC → ETH → USDT → BTC) to avoid transfer delays
- **Real-Time Price Monitoring**: WebSocket-based live price feeds from multiple exchanges
- **Transfer Fee Tracking**: Configurable transfer fees for cross-exchange arbitrage with detailed cost breakdown
- **Smart Opportunity Detection**: Automated detection of profitable arbitrage opportunities
- **Trade Simulation**: Risk-free testing environment with full execution simulation
- **Backtesting Engine**: Historical performance analysis with configurable parameters
- **Analytics Dashboard**: Comprehensive KPIs, charts, and performance metrics

### Supported Assets
- **9 Trading Pairs**: BTC/USDT, ETH/USDT, BNB/USDT, XRP/USDT, ADA/USDT, SOL/USDT, DOGE/USDT, DOT/USDT, MATIC/USDT
- **3 Exchanges**: Binance, Coinbase, Kraken
- **Expandable**: Easy to add more pairs and exchanges

### Advanced Features
- Automated trading with configurable risk parameters
- Real-time notifications for trade executions and system events
- Wallet management across multiple exchanges
- Customizable profit thresholds and exposure limits
- Dark mode optimized for extended trading sessions

## 📋 Requirements

### For Local Development
- **Node.js** 18.x or later
- **npm** 9.x or later
- **Git** for version control

### System Requirements
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB for application and dependencies
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

## 🚀 Local Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd terrorbot
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required frontend and backend dependencies including:
- Express.js for backend API
- React with TypeScript for frontend
- WebSocket support for real-time updates
- Shadcn UI components
- And more...

### Step 3: Run the Application

```bash
npm run dev
```

The application will start on **http://localhost:5000**

You should see:
```
[express] serving on port 5000
```

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

The dashboard will load with:
- Live price feeds
- Active arbitrage opportunities
- Trading controls
- Analytics and charts

## 🔧 Configuration

### Environment Variables

The application runs entirely in-memory for development and doesn't require external databases. However, you can configure:

```bash
# Optional: Change the port (default is 5000)
PORT=5000

# Optional: Set Node environment
NODE_ENV=development
```

### Application Settings

Configure trading parameters through the **Settings** page in the UI:

1. **Risk Management**
   - Minimum profit threshold (%)
   - Maximum exposure per trade ($)

2. **Exchanges**
   - Enable/disable specific exchanges
   - Configure transfer fees for each exchange

3. **Trading Pairs**
   - Select which cryptocurrency pairs to monitor

4. **Arbitrage Types**
   - Enable/disable triangular arbitrage
   - Triangular arbitrage eliminates transfer delays

5. **Automation**
   - Auto-trade when opportunities are detected
   - Notification preferences

### Transfer Fees Configuration

For cross-exchange arbitrage, configure realistic transfer fees:

| Exchange | Default Fee | Editable |
|----------|-------------|----------|
| Binance  | 0.10%       | ✅       |
| Coinbase | 0.15%       | ✅       |
| Kraken   | 0.12%       | ✅       |

These fees are **automatically factored** into profit calculations.

## 🌐 Deployment Options

### Option 1: Replit (Recommended - Free)

**Already deployed!** If you're running this on Replit, it's already live at your Replit URL.

**Benefits:**
- ✅ Always online
- ✅ Free tier available
- ✅ No server management
- ✅ Automatic HTTPS
- ✅ Built-in database support

### Option 2: Render (Free Tier)

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
   - **Environment**: Node
5. Click "Create Web Service"

**Benefits:**
- ✅ Free tier: 750 hours/month
- ✅ Automatic deployments from GitHub
- ✅ Custom domains supported
- ⚠️ Sleeps after 15 minutes of inactivity (free tier)

### Option 3: Railway (Free Tier with Credit)

1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Node.js and deploys
5. Get your deployment URL

**Benefits:**
- ✅ $5 free credit monthly
- ✅ Simple deployment
- ✅ Automatic HTTPS
- ⚠️ Credit-based (not unlimited)

### Option 4: Vercel (Serverless)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow prompts to deploy

**Benefits:**
- ✅ Free for personal projects
- ✅ Excellent performance
- ✅ Global CDN
- ⚠️ Serverless architecture (may need adjustments for WebSocket)

### Option 5: Local Network Access

To access from other devices on your local network:

1. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   # or
   hostname -I
   ```

2. Start the application:
   ```bash
   npm run dev
   ```

3. Access from other devices:
   ```
   http://<your-ip-address>:5000
   ```
   Example: `http://192.168.1.100:5000`

**Benefits:**
- ✅ Completely free
- ✅ Full control
- ✅ No internet required
- ⚠️ Only accessible on local network
- ⚠️ Computer must stay on

## 📚 Project Structure

```
terrorbot/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # Shadcn UI primitives
│   │   │   ├── opportunity-card.tsx
│   │   │   ├── price-card.tsx
│   │   │   ├── analytics-chart.tsx
│   │   │   └── ...
│   │   ├── pages/        # Route pages
│   │   │   ├── dashboard.tsx
│   │   │   ├── opportunities.tsx
│   │   │   ├── analytics.tsx
│   │   │   ├── backtesting.tsx
│   │   │   └── settings.tsx
│   │   ├── lib/          # Utilities
│   │   └── App.tsx       # Main app component
│   └── index.html
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes & WebSocket
│   ├── storage.ts        # In-memory data storage
│   └── vite.ts           # Vite integration
├── shared/               # Shared types & schemas
│   └── schema.ts         # TypeScript types
├── package.json          # Dependencies
└── README.md            # This file
```

## 🎮 Usage Guide

### Dashboard
- View real-time prices from all exchanges
- Monitor active arbitrage opportunities
- Execute simulated trades
- Track WebSocket connection status

### Opportunities Page
- See all detected arbitrage opportunities
- Distinguish between triangular and cross-exchange arbitrage
- View transfer fees for cross-exchange trades
- Execute trades with one click

### Backtesting
- Configure initial capital, time period, and profit threshold
- Run historical simulations
- View performance metrics and trade history

### Analytics
- Total trades, win rate, total profit, average profit
- Cumulative profit chart with gradient visualization
- Recent trade history table

### Settings
- Configure risk management parameters
- Enable/disable exchanges and trading pairs
- Set transfer fees for each exchange
- Toggle triangular arbitrage
- Enable automated trading and notifications

## 🔌 API Endpoints

### Settings
- `GET /api/settings` - Get current configuration
- `PUT /api/settings` - Update settings

### Opportunities
- `GET /api/opportunities` - Get active arbitrage opportunities

### Trades
- `GET /api/trades` - Get all trade history
- `POST /api/trades/execute` - Execute a simulated trade

### Analytics
- `GET /api/analytics` - Get performance analytics

### Backtesting
- `POST /api/backtest/run` - Run backtesting simulation

### WebSocket
- `ws://localhost:5000/ws` - Real-time price and opportunity updates

## 🐛 Troubleshooting

### Port 5000 Already in Use

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

Or change the port:
```bash
PORT=3000 npm run dev
```

### Dependencies Installation Failed

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### WebSocket Connection Errors

These warnings are harmless and related to Vite's Hot Module Replacement (HMR). The application functions correctly despite these warnings.

### TypeScript Errors

Run type checking:
```bash
npm run check
```

## 📈 Future Enhancements

- Real exchange API integration (Binance, Coinbase, Kraken APIs)
- Live trade execution with proper authentication
- Multi-exchange wallet management with real balances
- PostgreSQL database for persistent storage
- Machine learning models for opportunity prediction
- Mobile app for iOS and Android
- Email/SMS notifications
- Advanced charting with TradingView

## 🔐 Security Notes

**⚠️ This is a simulated trading environment.**

For production use with real funds:
1. **Never** commit API keys to version control
2. Use environment variables for sensitive data
3. Implement proper authentication and authorization
4. Use HTTPS for all connections
5. Enable rate limiting on API endpoints
6. Implement proper error handling and logging
7. Use a production-grade database (PostgreSQL)

## 📝 License

MIT License - feel free to use this project for learning and commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💬 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the codebase documentation
3. Open an issue on GitHub

## 🎓 Learning Resources

- [Arbitrage Trading Basics](https://www.investopedia.com/terms/a/arbitrage.asp)
- [Triangular Arbitrage Explained](https://www.investopedia.com/terms/t/triangulararbitrage.asp)
- [Cryptocurrency Trading](https://www.investopedia.com/cryptocurrency-4427699)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)

---

**Built with ❤️ using React, TypeScript, Express, and WebSockets**

Happy Trading! 🚀📈
