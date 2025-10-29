import { useQuery } from "@tanstack/react-query";
import { PriceCard } from "@/components/price-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { Activity, Repeat, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { PriceUpdate, OpportunityUpdate, Settings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const [prices, setPrices] = useState<PriceUpdate[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityUpdate[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setWsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "price") {
        setPrices((prev) => {
          const filtered = prev.filter(p => !(p.exchange === data.exchange && p.symbol === data.symbol));
          return [...filtered, data].slice(-12);
        });
      } else if (data.type === "opportunity") {
        setOpportunities((prev) => {
          const exists = prev.find(o => o.id === data.id);
          if (exists) return prev;
          return [data, ...prev].slice(0, 5);
        });
      }
    };

    socket.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleExecuteTrade = async (opportunityId: string) => {
    try {
      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (!opportunity) return;

      await apiRequest("POST", "/api/trades/execute", {
        opportunityId,
        path: opportunity.path,
        profitPercent: opportunity.profitPercent,
      });

      toast({
        title: "Trade Executed",
        description: `Simulated trade completed with ${opportunity.profitPercent.toFixed(2)}% profit`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute trade",
        variant: "destructive",
      });
    }
  };

  const singleExchangeOpps = opportunities.filter(o => o.path.type === "triangular");
  const crossExchangeOpps = opportunities.filter(o => o.path.type === "cross-exchange");

  const autoTradeActive = settings?.autoTradeCrossExchange || settings?.autoTradeSamePlatform;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Trading Dashboard</h1>
          {autoTradeActive && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 flex items-center gap-1" data-testid="badge-auto-trade-active">
              <Zap className="h-3 w-3" />
              Auto-Trade Active
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Real-time price monitoring and arbitrage opportunities
        </p>
        {autoTradeActive && (
          <div className="flex gap-2 mt-2">
            {settings.autoTradeCrossExchange && (
              <Badge variant="outline" className="text-xs" data-testid="badge-cross-exchange-enabled">
                Cross-Exchange Enabled
              </Badge>
            )}
            {settings.autoTradeSamePlatform && (
              <Badge variant="outline" className="text-xs" data-testid="badge-same-platform-enabled">
                Same-Platform Enabled
              </Badge>
            )}
            {settings.autoTradeSimulation && (
              <Badge variant="secondary" className="text-xs" data-testid="badge-simulation-mode">
                Simulation Mode
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prices.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {wsConnected ? "Waiting for price data..." : "Connecting to live feed..."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          prices.map((price, index) => (
            <PriceCard
              key={`${price.exchange}-${price.symbol}-${index}`}
              exchange={price.exchange}
              symbol={price.symbol}
              price={price.price}
              timestamp={price.timestamp}
            />
          ))
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Active Opportunities</h2>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3" data-testid="tabs-opportunities">
            <TabsTrigger value="all" data-testid="tab-all">All ({opportunities.length})</TabsTrigger>
            <TabsTrigger value="single" data-testid="tab-single">
              <Repeat className="h-4 w-4 mr-2" />
              Single ({singleExchangeOpps.length})
            </TabsTrigger>
            <TabsTrigger value="cross" data-testid="tab-cross">
              <TrendingUp className="h-4 w-4 mr-2" />
              Cross ({crossExchangeOpps.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {opportunities.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      No arbitrage opportunities detected yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                opportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    id={opp.id}
                    path={opp.path}
                    profitPercent={opp.profitPercent}
                    timestamp={opp.timestamp}
                    onExecute={handleExecuteTrade}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="single" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {singleExchangeOpps.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      No single-exchange arbitrage opportunities detected yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                singleExchangeOpps.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    id={opp.id}
                    path={opp.path}
                    profitPercent={opp.profitPercent}
                    timestamp={opp.timestamp}
                    onExecute={handleExecuteTrade}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="cross" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {crossExchangeOpps.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      No cross-exchange arbitrage opportunities detected yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                crossExchangeOpps.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    id={opp.id}
                    path={opp.path}
                    profitPercent={opp.profitPercent}
                    timestamp={opp.timestamp}
                    onExecute={handleExecuteTrade}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
