import {
  type ExchangePrice,
  type ArbitrageOpportunity,
  type Trade,
  type Settings,
  type InsertExchangePrice,
  type InsertArbitrageOpportunity,
  type InsertTrade,
  type InsertSettings,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  
  addExchangePrice(price: InsertExchangePrice): Promise<ExchangePrice>;
  getRecentPrices(limit?: number): Promise<ExchangePrice[]>;
  
  addArbitrageOpportunity(opportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity>;
  getActiveOpportunities(): Promise<ArbitrageOpportunity[]>;
  
  addTrade(trade: InsertTrade): Promise<Trade>;
  getAllTrades(): Promise<Trade[]>;
  getRecentTrades(limit?: number): Promise<Trade[]>;
}

export class MemStorage implements IStorage {
  private settings: Settings | undefined;
  private prices: Map<string, ExchangePrice>;
  private opportunities: Map<string, ArbitrageOpportunity>;
  private trades: Map<string, Trade>;

  constructor() {
    this.prices = new Map();
    this.opportunities = new Map();
    this.trades = new Map();
    
    this.settings = {
      id: randomUUID(),
      minProfitPercent: "0.5",
      maxExposurePerTrade: "1000",
      enabledExchanges: ["binance", "coinbase", "kraken"],
      enabledPairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT"],
      updatedAt: new Date(),
    };
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    this.settings = {
      id: this.settings?.id || randomUUID(),
      ...insertSettings,
      updatedAt: new Date(),
    };
    return this.settings;
  }

  async addExchangePrice(insertPrice: InsertExchangePrice): Promise<ExchangePrice> {
    const id = randomUUID();
    const price: ExchangePrice = {
      id,
      ...insertPrice,
      timestamp: new Date(),
    };
    this.prices.set(id, price);
    return price;
  }

  async getRecentPrices(limit = 50): Promise<ExchangePrice[]> {
    return Array.from(this.prices.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async addArbitrageOpportunity(insertOpp: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity> {
    const id = randomUUID();
    const opportunity: ArbitrageOpportunity = {
      id,
      ...insertOpp,
      timestamp: new Date(),
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async getActiveOpportunities(): Promise<ArbitrageOpportunity[]> {
    return Array.from(this.opportunities.values())
      .filter((opp) => opp.status === "active")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  }

  async addTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = randomUUID();
    const trade: Trade = {
      id,
      ...insertTrade,
      timestamp: new Date(),
    };
    this.trades.set(id, trade);
    return trade;
  }

  async getAllTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getRecentTrades(limit = 50): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
