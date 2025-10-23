import { useQuery } from "@tanstack/react-query";
import { OpportunityCard } from "@/components/opportunity-card";
import { Card, CardContent } from "@/components/ui/card";
import type { ArbitrageOpportunity } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Opportunities() {
  const { toast } = useToast();

  const { data: opportunities = [], isLoading } = useQuery<ArbitrageOpportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const handleExecuteTrade = async (opportunityId: string) => {
    try {
      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (!opportunity) return;

      await apiRequest("POST", "/api/trades/execute", {
        opportunityId,
        path: opportunity.path,
        profitPercent: opportunity.profitPercent,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });

      toast({
        title: "Trade Executed",
        description: `Simulated trade completed with ${parseFloat(opportunity.profitPercent).toFixed(2)}% profit`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute trade",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Arbitrage Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Detected trading opportunities across exchanges
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Arbitrage Opportunities</h1>
        <p className="text-muted-foreground mt-1">
          Detected trading opportunities across exchanges
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                No arbitrage opportunities available at the moment
              </p>
            </CardContent>
          </Card>
        ) : (
          opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              id={opp.id}
              path={opp.path}
              profitPercent={parseFloat(opp.profitPercent)}
              timestamp={new Date(opp.timestamp).getTime()}
              onExecute={handleExecuteTrade}
            />
          ))
        )}
      </div>
    </div>
  );
}
