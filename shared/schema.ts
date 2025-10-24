import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const exchangePrices = pgTable("exchange_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exchange: text("exchange").notNull(),
  symbol: text("symbol").notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const arbitrageOpportunities = pgTable("arbitrage_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  arbitrageType: text("arbitrage_type").notNull().default("cross-exchange"),
  path: jsonb("path").notNull().$type<ArbitragePath>(),
  profitPercent: decimal("profit_percent", { precision: 10, scale: 4 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
});

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityId: varchar("opportunity_id").references(() => arbitrageOpportunities.id),
  path: jsonb("path").notNull().$type<ArbitragePath>(),
  initialAmount: decimal("initial_amount", { precision: 20, scale: 8 }).notNull(),
  finalAmount: decimal("final_amount", { precision: 20, scale: 8 }).notNull(),
  profitPercent: decimal("profit_percent", { precision: 10, scale: 4 }).notNull(),
  profitAmount: decimal("profit_amount", { precision: 20, scale: 8 }).notNull(),
  status: text("status").notNull().default("simulated"),
  executionDetails: jsonb("execution_details").$type<ExecutionDetails>(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const exchangeConnections = pgTable("exchange_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exchangeName: text("exchange_name").notNull().unique(),
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  connectionStatus: text("connection_status").notNull().default("disconnected"),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exchangeConnectionId: varchar("exchange_connection_id").references(() => exchangeConnections.id).notNull(),
  currency: text("currency").notNull(),
  balance: decimal("balance", { precision: 20, scale: 8 }).notNull().default("0"),
  available: decimal("available", { precision: 20, scale: 8 }).notNull().default("0"),
  locked: decimal("locked", { precision: 20, scale: 8 }).notNull().default("0"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  minProfitPercent: decimal("min_profit_percent", { precision: 10, scale: 4 }).notNull().default("0.5"),
  maxExposurePerTrade: decimal("max_exposure_per_trade", { precision: 20, scale: 8 }).notNull().default("1000"),
  enabledExchanges: jsonb("enabled_exchanges").notNull().$type<string[]>().default(sql`'["binance", "coinbase", "kraken", "okx", "kucoin"]'::jsonb`),
  enabledPairs: jsonb("enabled_pairs").notNull().$type<string[]>().default(sql`'["BTC/USDT", "ETH/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "SOL/USDT", "DOGE/USDT", "DOT/USDT", "MATIC/USDT", "ETH/BTC", "BNB/ETH", "SOL/BTC"]'::jsonb`),
  transferFees: jsonb("transfer_fees").notNull().$type<Record<string, number>>().default(sql`'{"binance": 0.1, "coinbase": 0.15, "kraken": 0.12, "okx": 0.1, "kucoin": 0.1}'::jsonb`),
  tradingFees: jsonb("trading_fees").notNull().$type<Record<string, number>>().default(sql`'{"binance": 0.1, "coinbase": 0.5, "kraken": 0.26, "okx": 0.1, "kucoin": 0.1}'::jsonb`),
  tradingAmounts: jsonb("trading_amounts").notNull().$type<Record<string, number>>().default(sql`'{"binance": 1000, "coinbase": 1000, "kraken": 1000, "okx": 1000, "kucoin": 1000}'::jsonb`),
  simulationAmount: decimal("simulation_amount", { precision: 20, scale: 8 }).notNull().default("1000"),
  enableTriangularArbitrage: boolean("enable_triangular_arbitrage").notNull().default(true),
  enableCrossExchangeArbitrage: boolean("enable_cross_exchange_arbitrage").notNull().default(true),
  autoTradeEnabled: boolean("auto_trade_enabled").notNull().default(false),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ArbitragePath = {
  type: "cross-exchange" | "triangular";
  exchanges: string[];
  pairs: string[];
  prices: number[];
  transferFees?: number[];
};

export type ExecutionDetails = {
  steps: {
    exchange: string;
    action: string;
    status: string;
    amount?: number;
    price?: number;
    error?: string;
  }[];
  fallbackUsed?: boolean;
  retryCount?: number;
};

export type ExchangePrice = typeof exchangePrices.$inferSelect;
export type ArbitrageOpportunity = typeof arbitrageOpportunities.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type ExchangeConnection = typeof exchangeConnections.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Settings = typeof settings.$inferSelect;

export const insertExchangePriceSchema = createInsertSchema(exchangePrices).omit({
  id: true,
  timestamp: true,
});

export const insertArbitrageOpportunitySchema = createInsertSchema(arbitrageOpportunities).omit({
  id: true,
  timestamp: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  timestamp: true,
});

export const insertExchangeConnectionSchema = createInsertSchema(exchangeConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastChecked: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  lastUpdated: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  timestamp: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export type InsertExchangePrice = z.infer<typeof insertExchangePriceSchema>;
export type InsertArbitrageOpportunity = z.infer<typeof insertArbitrageOpportunitySchema>;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type InsertExchangeConnection = z.infer<typeof insertExchangeConnectionSchema>;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type PriceUpdate = {
  type: "price";
  exchange: string;
  symbol: string;
  price: number;
  timestamp: number;
};

export type OpportunityUpdate = {
  type: "opportunity";
  id: string;
  path: ArbitragePath;
  profitPercent: number;
  timestamp: number;
};

export type TradeUpdate = {
  type: "trade";
  trade: Trade;
};

export type NotificationUpdate = {
  type: "notification";
  notification: Notification;
};

export type WalletUpdate = {
  type: "wallet";
  wallets: Wallet[];
};

export type TradeResult = {
  id: string;
  success: boolean;
  profitPercent: number;
  profitAmount: number;
  path: ArbitragePath;
};

export type AnalyticsData = {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  averageProfit: number;
  recentTrades: Trade[];
};
