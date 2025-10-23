import { useQuery } from "@tanstack/react-query";
import { PriceCard } from "@/components/price-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PriceUpdate, OpportunityUpdate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const [prices, setPrices] = useState<PriceUpdate[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityUpdate[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trading Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Real-time price monitoring and arbitrage opportunities
        </p>
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
      </div>
    </div>
  );
}
