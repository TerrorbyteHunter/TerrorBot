# TerrorBot - Cryptocurrency Arbitrage Trading Platform

## Overview

TerrorBot is a professional cryptocurrency arbitrage trading platform that monitors real-time price data across multiple exchanges to detect and execute profitable trading opportunities. The application simulates triangular arbitrage strategies by tracking price differences between exchanges like Binance, Coinbase, and Kraken for various cryptocurrency pairs (BTC/USDT, ETH/USDT, BNB/USDT).

The platform provides real-time price monitoring, opportunity detection with profit calculation, simulated trade execution, comprehensive analytics and performance tracking, and backtesting capabilities. It features a data-dense, trading platform-inspired UI with dark mode as the default, drawing design inspiration from Binance, Coinbase Pro, and TradingView.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing instead of React Router

**UI Component System:**
- Shadcn/ui component library with Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for type-safe component variants
- Custom color palette optimized for trading data visualization (profit/loss semantic colors)

**State Management:**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- Local React state for UI-specific concerns
- Real-time WebSocket connection for live price and opportunity updates

**Design System:**
- Dark mode primary theme with trading-specific semantic colors (green for profit, red for loss)
- Inter font for UI/labels, JetBrains Mono for monospace numbers/metrics
- Trading platform-inspired layout with data-dense information hierarchy
- Custom CSS variables for consistent theming across light/dark modes

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server with TypeScript support
- WebSocket Server (ws library) for real-time bidirectional communication
- Middleware for JSON parsing, request logging, and error handling

**API Design:**
- RESTful endpoints for settings, trades, opportunities, and analytics
- WebSocket protocol for streaming price updates and opportunity alerts
- Mock data generation for simulating exchange prices and arbitrage detection
- In-memory storage implementation (MemStorage) as primary data layer

**Data Flow:**
- Server generates mock price data with configurable volatility
- Arbitrage opportunity detection algorithm analyzes price spreads
- WebSocket broadcasts updates to all connected clients in real-time
- Trade execution persists simulated transactions with profit calculations

### Data Storage Solutions

**Database Configuration:**
- Drizzle ORM for type-safe database queries and schema management
- PostgreSQL as the target database (via @neondatabase/serverless driver)
- Schema defines four main tables: exchange_prices, arbitrage_opportunities, trades, settings

**Schema Design:**
- Exchange prices track real-time price data with exchange, symbol, price, and timestamp
- Arbitrage opportunities store detected paths with JSONB for flexible path structures
- Trades record executed transactions with profit metrics and status tracking
- Settings maintain user configuration (min profit threshold, max exposure, enabled exchanges/pairs)

**Storage Strategy:**
- Current implementation uses in-memory storage (MemStorage) for rapid prototyping
- Database migrations configured via Drizzle Kit with PostgreSQL dialect
- Schema uses UUID primary keys, decimal types for precise financial calculations
- JSONB columns for complex nested data (arbitrage paths, array configurations)

### External Dependencies

**Third-Party UI Libraries:**
- Radix UI suite (@radix-ui/*) for accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- Recharts for data visualization and analytics charts
- Embla Carousel for carousel functionality
- Lucide React for consistent icon system

**Development Tools:**
- Replit-specific plugins for development banner, error overlay, and cartographer
- ESBuild for server-side bundling
- Drizzle Kit for database schema migrations
- TSX for TypeScript execution in development

**Runtime Libraries:**
- date-fns for date manipulation and formatting
- zod for runtime schema validation (via drizzle-zod)
- React Hook Form with resolvers for form state management
- nanoid for generating unique identifiers

**WebSocket Communication:**
- Native WebSocket API on client-side
- ws library on server-side for WebSocket server implementation
- Automatic reconnection handling in client
- JSON-based message protocol for price and opportunity updates