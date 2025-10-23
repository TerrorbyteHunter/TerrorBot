import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/kpi-card";
import { AnalyticsChart } from "@/components/analytics-chart";
import { TradeHistoryTable } from "@/components/trade-history-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Percent, BarChart3 } from "lucide-react";
import type { AnalyticsData } from "@shared/schema";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track performance metrics and trading history
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { totalTrades = 0, winRate = 0, totalProfit = 0, averageProfit = 0, recentTrades = [] } = analytics || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track performance metrics and trading history
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Trades"
          value={totalTrades}
          icon={BarChart3}
          description="All simulated trades"
        />
        <KPICard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          icon={Percent}
          description="Profitable trades"
          trend={winRate > 50 ? "up" : winRate < 50 ? "down" : "neutral"}
        />
        <KPICard
          title="Total Profit"
          value={`$${totalProfit.toFixed(2)}`}
          icon={DollarSign}
          description="Cumulative profit"
          trend={totalProfit > 0 ? "up" : totalProfit < 0 ? "down" : "neutral"}
        />
        <KPICard
          title="Avg Profit"
          value={`$${averageProfit.toFixed(2)}`}
          icon={TrendingUp}
          description="Per trade average"
          trend={averageProfit > 0 ? "up" : averageProfit < 0 ? "down" : "neutral"}
        />
      </div>

      <AnalyticsChart trades={recentTrades} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeHistoryTable trades={recentTrades.slice(0, 10)} />
        </CardContent>
      </Card>
    </div>
  );
}
