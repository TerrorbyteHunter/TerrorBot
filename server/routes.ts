import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { PriceUpdate, OpportunityUpdate, TradeUpdate, NotificationUpdate, WalletUpdate, ExecutionDetails } from "@shared/schema";

const clients = new Set<WebSocket>();

function generateMockPrice(base: number, volatility: number = 0.01): number {
  return base * (1 + (Math.random() - 0.5) * volatility);
}

function detectArbitrageOpportunity() {
  const exchanges = ["binance", "coinbase", "kraken"];
  const basePrices = {
    "BTC/USDT": 45000,
    "ETH/USDT": 2500,
    "BNB/USDT": 350,
  };

  const pair = Object.keys(basePrices)[Math.floor(Math.random() * Object.keys(basePrices).length)] as keyof typeof basePrices;
  const selectedExchanges = exchanges.sort(() => Math.random() - 0.5).slice(0, 3);
  
  const prices = selectedExchanges.map(() => generateMockPrice(basePrices[pair], 0.02));
  
  const initialPrice = prices[0];
  const finalPrice = prices[prices.length - 1];
  const profitPercent = ((finalPrice - initialPrice) / initialPrice) * 100;

  if (Math.abs(profitPercent) > 0.3) {
    return {
      path: {
        exchanges: selectedExchanges,
        pairs: selectedExchanges.map(() => pair),
        prices: prices,
      },
      profitPercent: profitPercent,
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

  const allStepsSucceeded = executionDetails.steps.every(step => step.status === "completed");
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
    const opportunities = await storage.getActiveOpportunities();
    res.json(opportunities);
  });

  app.post("/api/trades/execute", async (req, res) => {
    try {
      const { opportunityId, path, profitPercent, autoExecute } = req.body;
      const initialAmount = 1000;

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
    const trades = await storage.getAllTrades();
    res.json(trades);
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
      
      const simulatedTrades = [];
      const numTrades = Math.floor(days * 5);

      for (let i = 0; i < numTrades; i++) {
        const opportunity = detectArbitrageOpportunity();
        
        if (opportunity && Math.abs(opportunity.profitPercent) >= parseFloat(minProfit)) {
          const tradeAmount = Math.min(parseFloat(initialCapital) * 0.1, 1000);
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
            const locked = (Math.random() * balance).toFixed(2);
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

  const exchanges = ["binance", "coinbase", "kraken"];
  const pairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT"];
  const basePrices: Record<string, number> = {
    "BTC/USDT": 45000,
    "ETH/USDT": 2500,
    "BNB/USDT": 350,
  };

  setInterval(() => {
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
      const opportunity = detectArbitrageOpportunity();
      if (opportunity) {
        storage.addArbitrageOpportunity({
          path: opportunity.path,
          profitPercent: opportunity.profitPercent.toString(),
          status: "active",
        }).then(async (opp) => {
          const oppUpdate: OpportunityUpdate = {
            type: "opportunity",
            id: opp.id,
            path: opp.path,
            profitPercent: parseFloat(opp.profitPercent),
            timestamp: new Date(opp.timestamp).getTime(),
          };
          broadcastToClients(oppUpdate);

          const settings = await storage.getSettings();
          if (settings?.autoTradeEnabled && parseFloat(opp.profitPercent) >= parseFloat(settings.minProfitPercent)) {
            const maxExposure = parseFloat(settings.maxExposurePerTrade as any);
            await executeTradeWithFallback(
              opp.id,
              opp.path,
              opp.profitPercent,
              maxExposure
            );
          }
        });
      }
    }
  }, 3000);

  return httpServer;
}
