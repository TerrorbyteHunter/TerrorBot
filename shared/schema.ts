import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
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
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  minProfitPercent: decimal("min_profit_percent", { precision: 10, scale: 4 }).notNull().default("0.5"),
  maxExposurePerTrade: decimal("max_exposure_per_trade", { precision: 20, scale: 8 }).notNull().default("1000"),
  enabledExchanges: jsonb("enabled_exchanges").notNull().$type<string[]>().default(sql`'["binance", "coinbase", "kraken"]'::jsonb`),
  enabledPairs: jsonb("enabled_pairs").notNull().$type<string[]>().default(sql`'["BTC/USDT", "ETH/USDT", "BNB/USDT"]'::jsonb`),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ArbitragePath = {
  exchanges: string[];
  pairs: string[];
  prices: number[];
};

export type ExchangePrice = typeof exchangePrices.$inferSelect;
export type ArbitrageOpportunity = typeof arbitrageOpportunities.$inferSelect;
export type Trade = typeof trades.$inferSelect;
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

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export type InsertExchangePrice = z.infer<typeof insertExchangePriceSchema>;
export type InsertArbitrageOpportunity = z.infer<typeof insertArbitrageOpportunitySchema>;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
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
