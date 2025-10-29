import {
  type ExchangePrice,
  type ArbitrageOpportunity,
  type Trade,
  type Settings,
  type ExchangeConnection,
  type Wallet,
  type Notification,
  type InsertExchangePrice,
  type InsertArbitrageOpportunity,
  type InsertTrade,
  type InsertSettings,
  type InsertExchangeConnection,
  type InsertWallet,
  type InsertNotification,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  
  addExchangePrice(price: InsertExchangePrice): Promise<ExchangePrice>;
  getRecentPrices(limit?: number): Promise<ExchangePrice[]>;
  
  addArbitrageOpportunity(opportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity>;
  getActiveOpportunities(): Promise<ArbitrageOpportunity[]>;
  getFilteredOpportunities(type?: string): Promise<ArbitrageOpportunity[]>;
  
  addTrade(trade: InsertTrade): Promise<Trade>;
  getAllTrades(): Promise<Trade[]>;
  getRecentTrades(limit?: number): Promise<Trade[]>;
  getFilteredTrades(filters: { startDate?: Date; endDate?: Date; status?: string; arbitrageType?: string }): Promise<Trade[]>;
  clearTrades(filters?: { startDate?: Date; endDate?: Date; status?: string; arbitrageType?: string }): Promise<number>;
  
  addExchangeConnection(connection: InsertExchangeConnection): Promise<ExchangeConnection>;
  getAllExchangeConnections(): Promise<ExchangeConnection[]>;
  getExchangeConnection(id: string): Promise<ExchangeConnection | undefined>;
  updateExchangeConnection(id: string, connection: Partial<InsertExchangeConnection>): Promise<ExchangeConnection | undefined>;
  deleteExchangeConnection(id: string): Promise<boolean>;
  
  addWallet(wallet: InsertWallet): Promise<Wallet>;
  getWalletsByExchange(exchangeConnectionId: string): Promise<Wallet[]>;
  getAllWallets(): Promise<Wallet[]>;
  updateWalletBalance(id: string, balance: string, available: string, locked: string): Promise<Wallet | undefined>;
  
  addNotification(notification: InsertNotification): Promise<Notification>;
  getAllNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private settings: Settings | undefined;
  private prices: Map<string, ExchangePrice>;
  private opportunities: Map<string, ArbitrageOpportunity>;
  private trades: Map<string, Trade>;
  private exchangeConnections: Map<string, ExchangeConnection>;
  private wallets: Map<string, Wallet>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.prices = new Map();
    this.opportunities = new Map();
    this.trades = new Map();
    this.exchangeConnections = new Map();
    this.wallets = new Map();
    this.notifications = new Map();
    
    this.settings = {
      id: randomUUID(),
      minProfitPercent: "0.5",
      maxExposurePerTrade: "1000",
      enabledExchanges: ["binance", "coinbase", "kraken", "okx", "kucoin"],
      enabledPairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "SOL/USDT", "DOGE/USDT", "DOT/USDT", "MATIC/USDT", "ETH/BTC", "BNB/ETH", "SOL/BTC"],
      transferFees: { binance: 0.1, coinbase: 0.15, kraken: 0.12, okx: 0.1, kucoin: 0.1 },
      tradingFees: { binance: 0.1, coinbase: 0.5, kraken: 0.26, okx: 0.1, kucoin: 0.1 },
      tradingAmounts: { binance: 1000, coinbase: 1000, kraken: 1000, okx: 1000, kucoin: 1000 },
      simulationAmount: "1000",
      enableTriangularArbitrage: true,
      enableCrossExchangeArbitrage: true,
      autoTradeEnabled: false,
      autoTradeCrossExchange: false,
      autoTradeSamePlatform: false,
      autoTradeSimulation: false,
      notificationsEnabled: true,
      updatedAt: new Date(),
    };
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.settings?.id || randomUUID();
    const enabledExchanges: string[] = (insertSettings.enabledExchanges as string[]) || ["binance", "coinbase", "kraken", "okx", "kucoin"];
    const enabledPairs: string[] = (insertSettings.enabledPairs as string[]) || ["BTC/USDT", "ETH/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "SOL/USDT", "DOGE/USDT", "DOT/USDT", "MATIC/USDT", "ETH/BTC", "BNB/ETH", "SOL/BTC"];
    const transferFees: Record<string, number> = (insertSettings.transferFees as Record<string, number>) || { binance: 0.1, coinbase: 0.15, kraken: 0.12, okx: 0.1, kucoin: 0.1 };
    const tradingFees: Record<string, number> = (insertSettings.tradingFees as Record<string, number>) || { binance: 0.1, coinbase: 0.5, kraken: 0.26, okx: 0.1, kucoin: 0.1 };
    const tradingAmounts: Record<string, number> = (insertSettings.tradingAmounts as Record<string, number>) || { binance: 1000, coinbase: 1000, kraken: 1000, okx: 1000, kucoin: 1000 };
    this.settings = {
      id,
      minProfitPercent: insertSettings.minProfitPercent || "0.5",
      maxExposurePerTrade: insertSettings.maxExposurePerTrade || "1000",
      simulationAmount: insertSettings.simulationAmount || "1000",
      enabledExchanges,
      enabledPairs,
      transferFees,
      tradingFees,
      tradingAmounts,
      enableTriangularArbitrage: insertSettings.enableTriangularArbitrage ?? true,
      enableCrossExchangeArbitrage: insertSettings.enableCrossExchangeArbitrage ?? true,
      autoTradeEnabled: insertSettings.autoTradeEnabled ?? false,
      autoTradeCrossExchange: insertSettings.autoTradeCrossExchange ?? false,
      autoTradeSamePlatform: insertSettings.autoTradeSamePlatform ?? false,
      autoTradeSimulation: insertSettings.autoTradeSimulation ?? false,
      notificationsEnabled: insertSettings.notificationsEnabled ?? true,
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
    const path = insertOpp.path as any;
    const opportunity: ArbitrageOpportunity = {
      id,
      arbitrageType: insertOpp.arbitrageType || "cross-exchange",
      path,
      profitPercent: insertOpp.profitPercent,
      status: insertOpp.status || "active",
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

  async getFilteredOpportunities(type?: string): Promise<ArbitrageOpportunity[]> {
    return Array.from(this.opportunities.values())
      .filter((opp) => {
        if (type && opp.arbitrageType !== type) return false;
        return opp.status === "active";
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  }

  async addTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = randomUUID();
    const path = insertTrade.path as any;
    const executionDetails = insertTrade.executionDetails as any;
    const trade: Trade = {
      id,
      opportunityId: insertTrade.opportunityId ?? null,
      path,
      initialAmount: insertTrade.initialAmount,
      finalAmount: insertTrade.finalAmount,
      profitPercent: insertTrade.profitPercent,
      profitAmount: insertTrade.profitAmount,
      status: insertTrade.status || "simulated",
      executionDetails: executionDetails || null,
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

  async getFilteredTrades(filters: { startDate?: Date; endDate?: Date; status?: string; arbitrageType?: string }): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .filter((trade) => {
        if (filters.startDate && new Date(trade.timestamp) < filters.startDate) return false;
        if (filters.endDate && new Date(trade.timestamp) > filters.endDate) return false;
        if (filters.status && trade.status !== filters.status) return false;
        if (filters.arbitrageType && trade.path && (trade.path as any).type !== filters.arbitrageType) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async clearTrades(filters?: { startDate?: Date; endDate?: Date; status?: string; arbitrageType?: string }): Promise<number> {
    let count = 0;
    if (!filters || Object.keys(filters).length === 0) {
      count = this.trades.size;
      this.trades.clear();
    } else {
      const toDelete: string[] = [];
      this.trades.forEach((trade, id) => {
        let shouldDelete = true;
        if (filters.startDate && new Date(trade.timestamp) < filters.startDate) shouldDelete = false;
        if (filters.endDate && new Date(trade.timestamp) > filters.endDate) shouldDelete = false;
        if (filters.status && trade.status !== filters.status) shouldDelete = false;
        if (filters.arbitrageType && trade.path && (trade.path as any).type !== filters.arbitrageType) shouldDelete = false;
        if (shouldDelete) {
          toDelete.push(id);
        }
      });
      toDelete.forEach(id => this.trades.delete(id));
      count = toDelete.length;
    }
    return count;
  }

  async addExchangeConnection(insertConnection: InsertExchangeConnection): Promise<ExchangeConnection> {
    const id = randomUUID();
    const connection: ExchangeConnection = {
      id,
      exchangeName: insertConnection.exchangeName,
      apiKey: insertConnection.apiKey,
      apiSecret: insertConnection.apiSecret,
      isActive: insertConnection.isActive ?? true,
      connectionStatus: insertConnection.connectionStatus || "disconnected",
      lastChecked: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.exchangeConnections.set(id, connection);
    return connection;
  }

  async getAllExchangeConnections(): Promise<ExchangeConnection[]> {
    return Array.from(this.exchangeConnections.values());
  }

  async getExchangeConnection(id: string): Promise<ExchangeConnection | undefined> {
    return this.exchangeConnections.get(id);
  }

  async updateExchangeConnection(id: string, updates: Partial<InsertExchangeConnection>): Promise<ExchangeConnection | undefined> {
    const existing = this.exchangeConnections.get(id);
    if (!existing) return undefined;

    const updated: ExchangeConnection = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.exchangeConnections.set(id, updated);
    return updated;
  }

  async deleteExchangeConnection(id: string): Promise<boolean> {
    return this.exchangeConnections.delete(id);
  }

  async addWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    const wallet: Wallet = {
      id,
      exchangeConnectionId: insertWallet.exchangeConnectionId,
      currency: insertWallet.currency,
      balance: insertWallet.balance || "0",
      available: insertWallet.available || "0",
      locked: insertWallet.locked || "0",
      lastUpdated: new Date(),
    };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async getWalletsByExchange(exchangeConnectionId: string): Promise<Wallet[]> {
    return Array.from(this.wallets.values())
      .filter((w) => w.exchangeConnectionId === exchangeConnectionId);
  }

  async getAllWallets(): Promise<Wallet[]> {
    return Array.from(this.wallets.values());
  }

  async updateWalletBalance(id: string, balance: string, available: string, locked: string): Promise<Wallet | undefined> {
    const wallet = this.wallets.get(id);
    if (!wallet) return undefined;

    const updated: Wallet = {
      ...wallet,
      balance,
      available,
      locked,
      lastUpdated: new Date(),
    };
    this.wallets.set(id, updated);
    return updated;
  }

  async addNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      id,
      type: insertNotification.type,
      title: insertNotification.title,
      message: insertNotification.message,
      severity: insertNotification.severity || "info",
      isRead: insertNotification.isRead ?? false,
      metadata: insertNotification.metadata || null,
      timestamp: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => !n.isRead)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;

    this.notifications.set(id, { ...notification, isRead: true });
    return true;
  }
}

export const storage = new MemStorage();
