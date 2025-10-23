# TerrorBot Design Guidelines

## Design Approach
**Selected Approach:** Trading Platform Reference + Tailwind Design System

Drawing inspiration from **Binance**, **Coinbase Pro**, and **TradingView** for their proven data-dense interfaces, combined with modern Tailwind components for rapid development. This approach prioritizes information density, real-time data clarity, and professional aesthetics over decorative elements.

**Key Principles:**
- Data First: Every pixel serves a functional purpose
- Instant Readability: Critical metrics visible at a glance
- Professional Credibility: Dark theme with measured color usage
- Performance Indicators: Clear visual feedback for profit/loss states

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary (default state):**
- Background Base: 222 47% 11% (deep charcoal)
- Surface Elevated: 222 47% 15% (card backgrounds)
- Surface Hover: 222 47% 18%
- Border Subtle: 222 20% 25%
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 71%

**Trading Semantic Colors:**
- Profit/Long: 142 71% 45% (vibrant green)
- Loss/Short: 0 84% 60% (sharp red)
- Warning: 38 92% 50% (amber alert)
- Neutral/Pending: 217 91% 60% (electric blue)

**Accent (minimal usage):**
- Primary Action: 262 83% 58% (deep purple - CTAs only)
- Secondary: 199 89% 48% (cyan - highlights)

### B. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - UI, labels, body text
- Monospace: 'JetBrains Mono' (Google Fonts) - prices, metrics, code

**Scale:**
- Display Numbers: text-4xl to text-6xl, font-bold (large price displays)
- Headings: text-lg to text-2xl, font-semibold
- Body/Labels: text-sm to text-base, font-medium
- Metrics/Data: text-xs to text-sm, font-mono (tabular figures)

### C. Layout System

**Tailwind Spacing Primitives:** Use units of **2, 4, 6, 8** for consistency
- Component padding: p-4, p-6
- Section spacing: gap-4, gap-6, space-y-8
- Card margins: m-4, mb-6

**Grid Structure:**
- Dashboard: 12-column grid (grid-cols-12)
- Sidebar Navigation: 16rem fixed width
- Main Content: Responsive with max-w-screen-2xl container

### D. Component Library

**Navigation:**
- Sidebar: Fixed left nav, dark surface, icon + label items
- Top Bar: Exchange selector, account balance, system status indicator

**Data Display:**
- Price Cards: Elevated cards with exchange logo, pair name, price (large mono), change % (color-coded)
- Opportunity Cards: Highlight border (profit green), potential profit badge, route visualization, execute button
- Tables: Striped rows (subtle), sticky headers, sortable columns, monospace numbers, right-aligned numerical data

**Charts/Visualizations:**
- Real-time Line Charts: Simple, clean axes, profit/loss color coding
- Arbitrage Triangle Diagrams: Exchange nodes connected by arrows, profit % on paths
- Performance Graphs: Area charts with gradient fills (green for profit zones)

**Forms & Inputs:**
- Dark input fields: bg-222-47-15, border-subtle, focus:border-primary
- Range Sliders: For risk parameters, min profit thresholds
- Toggle Switches: Enable/disable trading pairs, exchanges

**Overlays:**
- Modals: Centered, backdrop blur, max-w-2xl
- Toasts: Top-right notifications, color-coded by severity
- Tooltips: On hover for technical terms, exchange fees

### E. Animations

**Minimal & Purposeful Only:**
- Price Updates: Brief highlight flash (duration-200) on change
- New Opportunities: Subtle slide-in (slide-in-right) when detected
- Loading States: Simple pulse for skeletons
- NO: Distracting page transitions, decorative animations, scroll effects

---

## Dashboard Layout Structure

**Main Trading Dashboard:**
1. Top Bar: Logo, active exchanges (badges), total portfolio value, system status
2. Sidebar: Navigation (Dashboard, Opportunities, Backtesting, Analytics, Settings)
3. Main Grid (3-column responsive):
   - Left: Exchange price comparison table (2/3 width)
   - Right: Active opportunities list, recent trades (1/3 width)
4. Bottom: Real-time activity log, WebSocket connection status

**Opportunity Detail View:**
- Hero Section: Large opportunity card with profit calculation breakdown
- Execution Simulator: Step-by-step trade flow visualization
- Historical Performance: Similar past opportunities analysis

**Analytics Dashboard:**
- Multi-metric KPI cards (4-column grid): Total trades, win rate, total profit, average profit
- Performance chart (full-width): Line chart showing cumulative P&L over time
- Trade history table: Paginated, filterable by exchange/pair/date

---

## Images

**No Hero Images Required** - This is a utility application focused on data density.

**Icon Usage:**
- Use **Heroicons** (outline style) for navigation and UI actions
- Exchange Logos: Display actual exchange favicons/logos (small, 24px-32px)
- Status Icons: Circle indicators for connection status (solid fills)

**Visual Indicators:**
- Arrow icons for price direction (up/down)
- Warning triangles for risk alerts
- Check circles for successful simulations

---

## Accessibility & Responsiveness

- Maintain dark mode throughout (no light mode toggle needed for v1)
- High contrast ratios: 7:1 minimum for profit/loss colors against dark backgrounds
- Keyboard navigation: Tab through all interactive elements, Escape closes modals
- Responsive breakpoints: Full dashboard on lg:, stacked cards on mobile
- Form inputs: Consistent dark styling with clear focus states (ring-2 ring-primary)

---

**Production Notes:**
- WebSocket status must be persistently visible (top bar indicator)
- All numerical data right-aligned in tables
- Timestamps in consistent format (24-hour, UTC indicator)
- Profit/loss always color-coded with + or - prefix
- Loading states for real-time data (skeleton screens, not spinners)