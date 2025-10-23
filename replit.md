# TerrorBot - Cryptocurrency Arbitrage Trading Platform

## Overview
TerrorBot is a professional cryptocurrency arbitrage trading bot with real-time price monitoring, opportunity detection, backtesting capabilities, and comprehensive analytics. Built with a dark trading theme optimized for data-dense interfaces.

## Project Status
✅ **MVP Complete** - All core features implemented and tested

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
- Live price monitoring for multiple exchanges (Binance, Coinbase, Kraken)
- WebSocket connection indicator
- Active arbitrage opportunities display
- Real-time price updates every 3 seconds

### 2. Arbitrage Detection
- Triangular arbitrage opportunity identification
- Profit calculation with percentage display
- Visual path representation (Exchange A → B → C)
- Color-coded profit/loss indicators

### 3. Trade Simulation
- Execute simulated trades
- Track trade history
- Performance analytics
- Risk-free testing environment

### 4. Backtesting Engine
- Configurable parameters (initial capital, time period, profit threshold)
- Historical simulation
- Performance metrics (total trades, win rate, total profit)
- Detailed trade history

### 5. Analytics Dashboard
- KPI cards (Total Trades, Win Rate, Total Profit, Average Profit)
- Cumulative profit chart with gradient visualization
- Recent trade history table
- Color-coded profit/loss display

### 6. Settings Management
- Risk management parameters
  - Minimum profit threshold
  - Maximum exposure per trade
- Exchange toggle (enable/disable exchanges)
- Trading pair selection
- Persistent configuration

## Technical Details

### API Endpoints
- `GET /api/settings` - Retrieve current settings
- `PUT /api/settings` - Update trading preferences
- `GET /api/opportunities` - Get active arbitrage opportunities
- `POST /api/trades/execute` - Execute simulated trade
- `GET /api/trades` - Get all trade history
- `GET /api/analytics` - Get performance analytics
- `POST /api/backtest/run` - Run backtesting simulation

### WebSocket Events
- `price` - Real-time price updates from exchanges
- `opportunity` - New arbitrage opportunity detected

### Data Models
- **ExchangePrice**: Exchange, symbol, price, timestamp
- **ArbitrageOpportunity**: Trading path, profit percentage, status
- **Trade**: Execution details, profit/loss, timestamp
- **Settings**: Risk parameters, enabled exchanges/pairs

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
- Opportunity cards with profit badges
- Trade history table with monospace numbers
- Analytics charts with gradient fills
- KPI cards with trend indicators

## Running the Application

The application runs automatically on Replit:
- Frontend: Vite dev server
- Backend: Express server on port 5000
- WebSocket: `/ws` endpoint for real-time updates

## Development Notes

### Recent Changes
- Fixed OpportunityCard design to remove one-sided borders
- Fixed AnalyticsChart cumulative profit calculation
- Corrected apiRequest usage for JSON response parsing
- Added TypeScript type definitions for all data models

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
All core features tested with Playwright:
- ✅ Dashboard navigation and layout
- ✅ Real-time price updates via WebSocket
- ✅ Backtesting engine with results display
- ✅ Settings management and persistence
- ✅ Analytics dashboard with charts
- ✅ Opportunity detection and display

## User Preferences
- Dark theme for reduced eye strain during trading
- Monospace fonts for numerical data alignment
- Data-dense layouts for maximum information display
- Professional aesthetics matching industry trading platforms
