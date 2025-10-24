# TerrorBot - Cryptocurrency Arbitrage Trading Platform

## Overview
TerrorBot is a professional cryptocurrency arbitrage trading bot with real-time price monitoring, opportunity detection, backtesting capabilities, and comprehensive analytics. Built with a dark trading theme optimized for data-dense interfaces.

## Project Status
✅ **MVP Complete** - All core features implemented and tested
✅ **Triangular Arbitrage** - Single-exchange arbitrage fully functional
✅ **Transfer Fees** - Cross-exchange fees properly tracked and displayed
✅ **Settings-Driven** - All detection logic respects user configuration

## Architecture

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn UI with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Real-time Updates**: WebSocket client for live price feeds
- **Charts**: Recharts for analytics visualization
- **Theme**: Dark mode optimized for trading (deep charcoal backgrounds)

### Backend
- **Server**: Express.js with TypeScript
- **WebSocket**: ws library for real-time price broadcasting
- **Storage**: In-memory storage (MemStorage) for MVP
- **Data Generation**: Mock price generator for simulated trading data

## Key Features

### 1. Real-Time Dashboard
- Live price monitoring for 5 exchanges (Binance, Coinbase, Kraken, OKX, KuCoin)
- WebSocket connection indicator
- Active arbitrage opportunities display with tabs for single-exchange vs cross-exchange
- Real-time price updates every 3 seconds
- Supports 12 trading pairs (9 USDT pairs + 3 cross-asset pairs)

### 2. Dual Arbitrage Detection

#### Cross-Exchange Arbitrage
- Detects price differences across multiple exchanges for the same pair
- Accounts for both transfer fees and trading fees in profit calculations
- Displays transfer fees breakdown on dashboard
- Uses configured transfer fees and trading amounts per exchange from settings
- Can be toggled on/off in settings

#### Triangular Arbitrage (Single-Exchange)
- Single-exchange arbitrage (e.g., BTC → ETH → USDT → BTC)
- No transfer delays or fees (only trading fees)
- Requires cross-asset pairs (ETH/BTC, BNB/ETH, SOL/BTC)
- Uses configured trading amounts per exchange
- Indicated with "Single exchange - No transfer delays" badge
- Can be toggled on/off in settings

### 3. Trade Simulation
- Execute simulated trades
- Track trade history
- Performance analytics
- Risk-free testing environment

### 4. Backtesting Engine
- Configurable parameters (initial capital, time period, profit threshold)
- Historical simulation using configured settings
- Performance metrics (total trades, win rate, total profit)
- Detailed trade history
- Respects enabled pairs, exchanges, and arbitrage type settings

### 5. Analytics Dashboard
- KPI cards (Total Trades, Win Rate, Total Profit, Average Profit)
- Cumulative profit chart with gradient visualization
- Recent trade history table with advanced filtering
- Filter by time frame (24h, 7d, 30d, all time)
- Filter by status (simulated, executed, failed, backtested)
- Filter by arbitrage type (single-exchange, cross-exchange, all)
- Clear stats functionality with filter-based deletion
- Color-coded profit/loss display

### 6. Settings Management
- **Risk Management**
  - Minimum profit threshold
  - Maximum exposure per trade
  - Simulation amount for test trades
  
- **Exchange Configuration**
  - Toggle exchanges (Binance, Coinbase, Kraken, OKX, KuCoin)
  - Configure transfer fees for each exchange
  - Configure trading fees for each exchange
  - Set trading amounts per exchange
  
- **Trading Pairs**
  - USDT Pairs: BTC, ETH, BNB, XRP, ADA, SOL, DOGE, DOT, MATIC
  - Cross-Asset Pairs: ETH/BTC, BNB/ETH, SOL/BTC (for triangular arbitrage)
  
- **Arbitrage Type**
  - Toggle single-exchange (triangular) arbitrage
  - Toggle cross-exchange arbitrage
  - All detection logic respects these settings

- **Persistent Configuration**
  - Settings saved and applied to all operations

## Technical Details

### API Endpoints
- `GET /api/settings` - Retrieve current settings
- `PUT /api/settings` - Update trading preferences
- `GET /api/opportunities` - Get active arbitrage opportunities
- `POST /api/trades/execute` - Execute simulated trade
- `GET /api/trades` - Get all trade history
- `GET /api/analytics` - Get performance analytics
- `POST /api/backtest/run` - Run backtesting simulation (uses settings)

### WebSocket Events
- `price` - Real-time price updates from exchanges
- `opportunity` - New arbitrage opportunity detected

### Data Models
- **ExchangePrice**: Exchange, symbol, price, timestamp
- **ArbitrageOpportunity**: Trading path, profit percentage, status, arbitrage type
- **Trade**: Execution details, profit/loss, timestamp
- **Settings**: Risk parameters, enabled exchanges/pairs, transfer fees, trading fees, trading amounts, simulation amount, arbitrage toggles

### Detection Logic (Settings-Driven)
All detection functions now respect user configuration:
- **detectTriangularArbitrage()**: Uses enabled exchanges, pairs, trading fees, and trading amounts from settings
- **detectCrossExchangeArbitrage()**: Uses enabled exchanges, pairs, transfer fees, trading fees, and trading amounts from settings
- **Backtesting**: Loads settings and applies same logic as live trading
- Triangular arbitrage only runs when `enableTriangularArbitrage` is true
- Cross-exchange arbitrage only runs when `enableCrossExchangeArbitrage` is true
- Only detects opportunities for enabled pairs and exchanges
- Profit calculations include trading fees deduction
- Trading amounts per exchange determine notional size for each opportunity

## Design System

### Colors
- **Background**: Deep charcoal (222 47% 11%)
- **Card Surface**: Elevated charcoal (222 47% 15%)
- **Profit**: Vibrant green (142 71% 45%)
- **Loss**: Sharp red (0 84% 60%)
- **Primary**: Deep purple (262 83% 58%)

### Typography
- **UI Text**: Inter font family
- **Numerical Data**: JetBrains Mono (monospace)
- Tabular figures for price alignment

### Components
- Sidebar navigation with icon + label
- Price cards with exchange badges
- Opportunity cards with arbitrage type badges
- Transfer fees breakdown display
- Trade history table with monospace numbers
- Analytics charts with gradient fills
- KPI cards with trend indicators
- Separated trading pairs sections (USDT vs Cross-Asset)
- Tabbed interface for single-exchange vs cross-exchange opportunities
- Advanced filtering controls in analytics

## Running the Application

The application runs automatically on Replit:
- Frontend: Vite dev server
- Backend: Express server on port 5000
- WebSocket: `/ws` endpoint for real-time updates

## Development Notes

### Recent Changes (October 24, 2025)
- ✅ Added OKX and KuCoin exchanges (now 5 total exchanges)
- ✅ Implemented trading fees per exchange with profit calculation integration
- ✅ Added configurable trading amounts per exchange
- ✅ Added simulation amount setting for test trades
- ✅ Implemented cross-exchange arbitrage toggle in settings
- ✅ Separated single-exchange and cross-exchange opportunities with tabs on dashboard and opportunities page
- ✅ Added comprehensive filtering to analytics (time frame, status, arbitrage type)
- ✅ Implemented clear stats functionality with filter-based deletion
- ✅ Trading fees now properly deducted from profit calculations
- ✅ Detection functions use trading amounts from settings for accurate profit calculations
- ✅ All previous fixes maintained (settings-driven detection, enabled pairs/exchanges filtering)

### Known Issues
- Vite HMR WebSocket warnings in console (does not affect application)
- Minor TypeScript strictness warnings in storage.ts (runtime safe)

## Future Enhancements
Listed in design_guidelines.md under "Next Phase":
- Real exchange API integration (Binance, Coinbase, Kraken)
- Live trade execution with authentication
- Multi-exchange wallet management
- Latency optimization (deploy near exchange servers)
- Mobile notifications for trade alerts
- Machine learning models for opportunity prediction

## Testing
All core features tested:
- ✅ Dashboard navigation and layout
- ✅ Real-time price updates via WebSocket
- ✅ Backtesting engine with results display
- ✅ Settings management and persistence
- ✅ Analytics dashboard with charts
- ✅ Opportunity detection for both arbitrage types
- ✅ Settings-driven detection (all features respect configuration)

## User Preferences
- Dark theme for reduced eye strain during trading
- Monospace fonts for numerical data alignment
- Data-dense layouts for maximum information display
- Professional aesthetics matching industry trading platforms
- Clear separation of arbitrage types
- Transparent fee disclosure for cross-exchange trades
