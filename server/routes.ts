import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { PriceUpdate, OpportunityUpdate } from "@shared/schema";

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
      const { opportunityId, path, profitPercent } = req.body;
      
      const initialAmount = 1000;
      const profitAmount = (initialAmount * parseFloat(profitPercent)) / 100;
      const finalAmount = initialAmount + profitAmount;

      const trade = await storage.addTrade({
        opportunityId,
        path,
        initialAmount: initialAmount.toString(),
        finalAmount: finalAmount.toString(),
        profitPercent: profitPercent.toString(),
        profitAmount: profitAmount.toString(),
        status: "simulated",
      });

      res.json(trade);
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
        }).then(opp => {
          const oppUpdate: OpportunityUpdate = {
            type: "opportunity",
            id: opp.id,
            path: opp.path,
            profitPercent: parseFloat(opp.profitPercent),
            timestamp: new Date(opp.timestamp).getTime(),
          };
          broadcastToClients(oppUpdate);
        });
      }
    }
  }, 3000);

  return httpServer;
}
