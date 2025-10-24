import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { PriceUpdate, OpportunityUpdate, TradeUpdate, NotificationUpdate, WalletUpdate, ExecutionDetails } from "@shared/schema";

const clients = new Set<WebSocket>();

function generateMockPrice(base: number, volatility: number = 0.01): number {
  return base * (1 + (Math.random() - 0.5) * volatility);
}

function detectTriangularArbitrage(enabledExchanges: string[], enabledPairs: string[], tradingFeesConfig: Record<string, number>, tradingAmountsConfig: Record<string, number>) {
  if (enabledExchanges.length === 0) return null;
  
  const exchange = enabledExchanges[Math.floor(Math.random() * enabledExchanges.length)];
  const initialAmount = tradingAmountsConfig[exchange] || 1000;
  
  const basePrices = {
    "BTC/USDT": 45000,
    "ETH/USDT": 2500,
    "BNB/USDT": 350,
    "XRP/USDT": 0.55,
    "ADA/USDT": 0.45,
    "SOL/USDT": 95,
    "DOGE/USDT": 0.08,
    "DOT/USDT": 6.5,
    "MATIC/USDT": 0.85,
  };

  const triangularPairs = [
    { pairs: ["BTC/USDT", "ETH/BTC", "ETH/USDT"], base: ["BTC", "ETH", "USDT"] },
    { pairs: ["ETH/USDT", "BNB/ETH", "BNB/USDT"], base: ["ETH", "BNB", "USDT"] },
    { pairs: ["BTC/USDT", "SOL/BTC", "SOL/USDT"], base: ["BTC", "SOL", "USDT"] },
  ];

  const availableTriangularPairs = triangularPairs.filter(tp =>
    tp.pairs.every(pair => enabledPairs.includes(pair))
  );

  if (availableTriangularPairs.length === 0) return null;

  const selected = availableTriangularPairs[Math.floor(Math.random() * availableTriangularPairs.length)];
  
  const btcPrice = generateMockPrice(basePrices["BTC/USDT"], 0.01);
  const ethPrice = generateMockPrice(basePrices["ETH/USDT"], 0.01);
  const bnbPrice = generateMockPrice(basePrices["BNB/USDT"], 0.01);
  const solPrice = generateMockPrice(basePrices["SOL/USDT"], 0.01);
  
  let prices: number[] = [];
  if (selected.pairs.includes("ETH/BTC")) {
    prices = [btcPrice, ethPrice / btcPrice * (1 + (Math.random() - 0.5) * 0.01), ethPrice];
  } else if (selected.pairs.includes("BNB/ETH")) {
    prices = [ethPrice, bnbPrice / ethPrice * (1 + (Math.random() - 0.5) * 0.01), bnbPrice];
  } else {
    prices = [btcPrice, solPrice / btcPrice * (1 + (Math.random() - 0.5) * 0.01), solPrice];
  }

  const tradingFee = tradingFeesConfig[exchange] || 0.1;
  const totalTradingFees = tradingFee * 3;

  let amount = initialAmount;
  amount = amount / prices[0];
  amount = amount * (1 - tradingFee / 100);
  amount = amount / prices[1];
  amount = amount * (1 - tradingFee / 100);
  amount = amount * prices[2];
  amount = amount * (1 - tradingFee / 100);
  
  const profitPercent = ((amount - initialAmount) / initialAmount) * 100;

  if (Math.abs(profitPercent) > 0.2) {
    return {
      arbitrageType: "triangular" as const,
      path: {
        type: "triangular" as const,
        exchanges: [exchange, exchange, exchange],
        pairs: selected.pairs,
        prices: prices,
        transferFees: [0, 0, 0],
      },
      profitPercent: profitPercent,
      tradingFees: totalTradingFees,
      initialAmount: initialAmount,
    };
  }

  return null;
}

function detectCrossExchangeArbitrage(enabledExchanges: string[], enabledPairs: string[], transferFeesConfig: Record<string, number>, tradingFeesConfig: Record<string, number>, tradingAmountsConfig: Record<string, number>) {
  if (enabledExchanges.length < 2 || enabledPairs.length === 0) return null;
  
  const basePrices = {
    "BTC/USDT": 45000,
    "ETH/USDT": 2500,
    "BNB/USDT": 350,
    "XRP/USDT": 0.55,
    "ADA/USDT": 0.45,
    "SOL/USDT": 95,
    "DOGE/USDT": 0.08,
    "DOT/USDT": 6.5,
    "MATIC/USDT": 0.85,
  };

  const availablePairs = Object.keys(basePrices).filter(pair => enabledPairs.includes(pair));
  if (availablePairs.length === 0) return null;

  const pair = availablePairs[Math.floor(Math.random() * availablePairs.length)] as keyof typeof basePrices;
  const selectedExchanges = enabledExchanges.sort(() => Math.random() - 0.5).slice(0, Math.min(3, enabledExchanges.length));
  
  const initialAmount = tradingAmountsConfig[selectedExchanges[0]] || 1000;
  
  const prices = selectedExchanges.map(() => generateMockPrice(basePrices[pair], 0.02));
  
  const transferFees = selectedExchanges.map(exchange => transferFeesConfig[exchange] || 0.1);
  const tradingFees = selectedExchanges.map(exchange => tradingFeesConfig[exchange] || 0.1);
  
  const initialPrice = prices[0];
  const finalPrice = prices[prices.length - 1];
  const totalTransferFees = transferFees.reduce((a, b) => a + b, 0);
  const totalTradingFees = tradingFees.reduce((a, b) => a + b, 0);
  const profitPercent = ((finalPrice - initialPrice) / initialPrice) * 100 - totalTransferFees - totalTradingFees;

  if (Math.abs(profitPercent) > 0.3) {
    return {
      arbitrageType: "cross-exchange" as const,
      path: {
        type: "cross-exchange" as const,
        exchanges: selectedExchanges,
        pairs: selectedExchanges.map(() => pair),
        prices: prices,
        transferFees: transferFees,
      },
      profitPercent: profitPercent,
      tradingFees: totalTradingFees,
      initialAmount: initialAmount,
    };
  }

  return null;
}

function broadcastToClients(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

async function executeTradeWithFallback(opportunityId: string | null, path: any, profitPercent: string, initialAmount: number) {
  const settings = await storage.getSettings();
  const notificationsEnabled = settings?.notificationsEnabled ?? true;

  const executionDetails: any = {
    steps: [],
    fallbackUsed: false,
    retryCount: 0,
  };

  for (let i = 0; i < path.exchanges.length; i++) {
    const exchange = path.exchanges[i];
    const pair = path.pairs[i];
    const price = path.prices[i];
    
    const success = Math.random() > 0.1;
    
    executionDetails.steps.push({
      exchange,
      action: `trade ${pair}`,
      status: success ? "completed" : "failed",
      amount: initialAmount,
      price,
      error: success ? undefined : "Simulated connection timeout",
    });

    if (!success && i < path.exchanges.length - 1) {
      executionDetails.fallbackUsed = true;
      executionDetails.retryCount = (executionDetails.retryCount || 0) + 1;
      
      if (notificationsEnabled) {
        await storage.addNotification({
          type: "trade_warning",
          title: "Trade Execution Issue",
          message: `Failed to execute on ${exchange}, attempting fallback`,
          severity: "warning",
          metadata: { opportunityId: opportunityId || "", exchange, pair },
        });
      }
    }
  }

  const allStepsSucceeded = executionDetails.steps.every((step: any) => step.status === "completed");
  const profitAmount = allStepsSucceeded ? (initialAmount * parseFloat(profitPercent)) / 100 : 0;
  const finalAmount = initialAmount + profitAmount;

  const trade = await storage.addTrade({
    opportunityId,
    path,
    initialAmount: initialAmount.toString(),
    finalAmount: finalAmount.toString(),
    profitPercent: profitPercent.toString(),
    profitAmount: profitAmount.toString(),
    status: allStepsSucceeded ? "executed" : "failed",
    executionDetails,
  });

  if (notificationsEnabled) {
    if (allStepsSucceeded) {
      await storage.addNotification({
        type: "trade_success",
        title: "Trade Executed Successfully",
        message: `Profit: $${profitAmount.toFixed(2)} (${profitPercent}%)`,
        severity: "success",
        metadata: { tradeId: trade.id, profitAmount, profitPercent },
      });
    } else {
      await storage.addNotification({
        type: "trade_error",
        title: "Trade Execution Failed",
        message: "Unable to complete all trade steps",
        severity: "error",
        metadata: { tradeId: trade.id },
      });
    }
  }

  const tradeUpdate: TradeUpdate = {
    type: "trade",
    trade,
  };
  broadcastToClients(tradeUpdate);

  return trade;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/settings", async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  app.get("/api/opportunities", async (req, res) => {
    const { type } = req.query;
    const opportunities = type 
      ? await storage.getFilteredOpportunities(type as string)
      : await storage.getActiveOpportunities();
    res.json(opportunities);
  });

  app.post("/api/trades/execute", async (req, res) => {
    try {
      const { opportunityId, path, profitPercent, autoExecute } = req.body;
      const settings = await storage.getSettings();
      const initialAmount = parseFloat(settings?.simulationAmount || "1000");

      if (autoExecute) {
        const trade = await executeTradeWithFallback(opportunityId || null, path, profitPercent.toString(), initialAmount);
        res.json(trade);
      } else {
        const profitAmount = (initialAmount * parseFloat(profitPercent)) / 100;
        const finalAmount = initialAmount + profitAmount;

        const trade = await storage.addTrade({
          opportunityId: opportunityId || null,
          path,
          initialAmount: initialAmount.toString(),
          finalAmount: finalAmount.toString(),
          profitPercent: profitPercent.toString(),
          profitAmount: profitAmount.toString(),
          status: "simulated",
        });

        res.json(trade);
      }
    } catch (error) {
      res.status(400).json({ error: "Failed to execute trade" });
    }
  });

  app.get("/api/trades", async (req, res) => {
    const { startDate, endDate, status, arbitrageType } = req.query;
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (status) filters.status = status as string;
    if (arbitrageType) filters.arbitrageType = arbitrageType as string;
    
    const trades = Object.keys(filters).length > 0
      ? await storage.getFilteredTrades(filters)
      : await storage.getAllTrades();
    res.json(trades);
  });

  app.post("/api/trades/clear", async (req, res) => {
    try {
      const { startDate, endDate, status, arbitrageType } = req.body;
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      if (status) filters.status = status;
      if (arbitrageType) filters.arbitrageType = arbitrageType;
      
      const count = await storage.clearTrades(Object.keys(filters).length > 0 ? filters : undefined);
      res.json({ success: true, count });
    } catch (error) {
      res.status(400).json({ error: "Failed to clear trades" });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    const trades = await storage.getAllTrades();
    
    const totalTrades = trades.length;
    const profitableTrades = trades.filter(t => parseFloat(t.profitAmount) > 0).length;
    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;
    const totalProfit = trades.reduce((sum, t) => sum + parseFloat(t.profitAmount), 0);
    const averageProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;
    const recentTrades = trades.slice(0, 50);

    res.json({
      totalTrades,
      winRate,
      totalProfit,
      averageProfit,
      recentTrades,
    });
  });

  app.post("/api/backtest/run", async (req, res) => {
    try {
      const { initialCapital, days, minProfit } = req.body;
      
      const settings = await storage.getSettings();
      if (!settings) {
        res.status(500).json({ error: "Settings not available" });
        return;
      }

      const enableTriangular = settings.enableTriangularArbitrage ?? true;
      const enabledExchanges = settings.enabledExchanges;
      const enabledPairs = settings.enabledPairs;
      const transferFeesConfig = settings.transferFees as Record<string, number>;
      const tradingFeesConfig = settings.tradingFees as Record<string, number>;
      const tradingAmountsConfig = settings.tradingAmounts as Record<string, number>;
      
      const simulatedTrades = [];
      const numTrades = Math.floor(days * 5);

      for (let i = 0; i < numTrades; i++) {
        let opportunity = null;
        
        if (enableTriangular && Math.random() > 0.5) {
          opportunity = detectTriangularArbitrage(enabledExchanges, enabledPairs, tradingFeesConfig, tradingAmountsConfig);
        } else {
          opportunity = detectCrossExchangeArbitrage(enabledExchanges, enabledPairs, transferFeesConfig, tradingFeesConfig, tradingAmountsConfig);
        }
        
        if (opportunity && Math.abs(opportunity.profitPercent) >= parseFloat(minProfit)) {
          const tradeAmount = opportunity.initialAmount || Math.min(parseFloat(initialCapital) * 0.1, 1000);
          const profitAmount = (tradeAmount * opportunity.profitPercent) / 100;
          const finalAmount = tradeAmount + profitAmount;

          const trade = await storage.addTrade({
            opportunityId: null,
            path: opportunity.path,
            initialAmount: tradeAmount.toString(),
            finalAmount: finalAmount.toString(),
            profitPercent: opportunity.profitPercent.toString(),
            profitAmount: profitAmount.toString(),
            status: "backtested",
          });

          simulatedTrades.push(trade);
        }
      }

      res.json({ trades: simulatedTrades });
    } catch (error) {
      res.status(400).json({ error: "Backtest failed" });
    }
  });

  app.get("/api/exchange-connections", async (req, res) => {
    const connections = await storage.getAllExchangeConnections();
    const redactedConnections = connections.map(conn => ({
      ...conn,
      apiKey: conn.apiKey.slice(-4),
      apiSecret: "***",
    }));
    res.json(redactedConnections);
  });

  app.post("/api/exchange-connections", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const notificationsEnabled = settings?.notificationsEnabled ?? true;

      const connection = await storage.addExchangeConnection(req.body);
      
      if (notificationsEnabled) {
        await storage.addNotification({
          type: "exchange_connected",
          title: "Exchange Connected",
          message: `Successfully connected to ${req.body.exchangeName}`,
          severity: "success",
          metadata: { exchangeName: req.body.exchangeName },
        });
      }

      const redacted = {
        ...connection,
        apiKey: connection.apiKey.slice(-4),
        apiSecret: "***",
      };
      res.json(redacted);
    } catch (error) {
      res.status(400).json({ error: "Failed to add exchange connection" });
    }
  });

  app.put("/api/exchange-connections/:id", async (req, res) => {
    try {
      const connection = await storage.updateExchangeConnection(req.params.id, req.body);
      if (!connection) {
        res.status(404).json({ error: "Connection not found" });
        return;
      }
      const redacted = {
        ...connection,
        apiKey: connection.apiKey.slice(-4),
        apiSecret: "***",
      };
      res.json(redacted);
    } catch (error) {
      res.status(400).json({ error: "Failed to update connection" });
    }
  });

  app.delete("/api/exchange-connections/:id", async (req, res) => {
    const success = await storage.deleteExchangeConnection(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Connection not found" });
    }
  });

  app.get("/api/wallets", async (req, res) => {
    const wallets = await storage.getAllWallets();
    res.json(wallets);
  });

  app.post("/api/wallets/refresh", async (req, res) => {
    try {
      const connections = await storage.getAllExchangeConnections();
      const wallets = [];

      for (const connection of connections) {
        if (connection.isActive) {
          const currencies = ["USDT", "BTC", "ETH", "BNB"];
          for (const currency of currencies) {
            const balance = (Math.random() * 10000).toFixed(2);
            const locked = (Math.random() * parseFloat(balance)).toFixed(2);
            const available = (parseFloat(balance) - parseFloat(locked)).toFixed(2);

            const wallet = await storage.addWallet({
              exchangeConnectionId: connection.id,
              currency,
              balance,
              available,
              locked,
            });
            wallets.push(wallet);
          }
        }
      }

      const walletUpdate: WalletUpdate = {
        type: "wallet",
        wallets,
      };
      broadcastToClients(walletUpdate);

      res.json(wallets);
    } catch (error) {
      res.status(400).json({ error: "Failed to refresh wallets" });
    }
  });

  app.get("/api/notifications", async (req, res) => {
    const notifications = await storage.getAllNotifications();
    res.json(notifications);
  });

  app.get("/api/notifications/unread", async (req, res) => {
    const notifications = await storage.getUnreadNotifications();
    res.json(notifications);
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    const success = await storage.markNotificationAsRead(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Notification not found" });
    }
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  const exchanges = ["binance", "coinbase", "kraken", "okx", "kucoin"];
  const pairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "SOL/USDT", "DOGE/USDT", "DOT/USDT", "MATIC/USDT"];
  const basePrices: Record<string, number> = {
    "BTC/USDT": 45000,
    "ETH/USDT": 2500,
    "BNB/USDT": 350,
    "XRP/USDT": 0.55,
    "ADA/USDT": 0.45,
    "SOL/USDT": 95,
    "DOGE/USDT": 0.08,
    "DOT/USDT": 6.5,
    "MATIC/USDT": 0.85,
  };

  setInterval(async () => {
    exchanges.forEach(exchange => {
      pairs.forEach(symbol => {
        const price = generateMockPrice(basePrices[symbol], 0.005);
        
        const priceUpdate: PriceUpdate = {
          type: "price",
          exchange,
          symbol,
          price,
          timestamp: Date.now(),
        };

        storage.addExchangePrice({
          exchange,
          symbol,
          price: price.toString(),
        });

        broadcastToClients(priceUpdate);
      });
    });

    if (Math.random() > 0.7) {
      const settings = await storage.getSettings();
      if (!settings) return;
      
      const enableTriangular = settings.enableTriangularArbitrage ?? true;
      const enableCrossExchange = settings.enableCrossExchangeArbitrage ?? true;
      const enabledExchanges = settings.enabledExchanges;
      const enabledPairs = settings.enabledPairs;
      const transferFeesConfig = settings.transferFees as Record<string, number>;
      const tradingFeesConfig = settings.tradingFees as Record<string, number>;
      const tradingAmountsConfig = settings.tradingAmounts as Record<string, number>;
      
      let opportunity = null;
      
      if (enableTriangular && enableCrossExchange) {
        if (Math.random() > 0.5) {
          opportunity = detectTriangularArbitrage(enabledExchanges, enabledPairs, tradingFeesConfig, tradingAmountsConfig);
        } else {
          opportunity = detectCrossExchangeArbitrage(enabledExchanges, enabledPairs, transferFeesConfig, tradingFeesConfig, tradingAmountsConfig);
        }
      } else if (enableTriangular) {
        opportunity = detectTriangularArbitrage(enabledExchanges, enabledPairs, tradingFeesConfig, tradingAmountsConfig);
      } else if (enableCrossExchange) {
        opportunity = detectCrossExchangeArbitrage(enabledExchanges, enabledPairs, transferFeesConfig, tradingFeesConfig, tradingAmountsConfig);
      }
      
      if (opportunity) {
        const opp = await storage.addArbitrageOpportunity({
          arbitrageType: opportunity.arbitrageType,
          path: opportunity.path,
          profitPercent: opportunity.profitPercent.toString(),
          status: "active",
        });
        
        const oppUpdate: OpportunityUpdate = {
          type: "opportunity",
          id: opp.id,
          path: opp.path,
          profitPercent: parseFloat(opp.profitPercent),
          timestamp: new Date(opp.timestamp).getTime(),
        };
        broadcastToClients(oppUpdate);

        if (settings.autoTradeEnabled && parseFloat(opp.profitPercent) >= parseFloat(settings.minProfitPercent)) {
          const maxExposure = parseFloat(settings.maxExposurePerTrade as any);
          await executeTradeWithFallback(
            opp.id,
            opp.path,
            opp.profitPercent,
            maxExposure
          );
        }
      }
    }
  }, 3000);

  return httpServer;
}
