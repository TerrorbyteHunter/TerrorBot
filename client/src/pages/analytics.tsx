import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { KPICard } from "@/components/kpi-card";
import { AnalyticsChart } from "@/components/analytics-chart";
import { TradeHistoryTable } from "@/components/trade-history-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Percent, BarChart3, Filter, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AnalyticsData } from "@shared/schema";

export default function Analytics() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    timeFrame: "all",
    status: "all",
    arbitrageType: "all",
  });

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const handleClearStats = async () => {
    try {
      const confirmClear = window.confirm(
        "Are you sure you want to clear these stats? This action cannot be undone."
      );
      if (!confirmClear) return;

      const clearFilters: any = {};
      
      if (filters.timeFrame !== "all") {
        const now = new Date();
        let startDate = new Date();
        if (filters.timeFrame === "24h") {
          startDate.setHours(now.getHours() - 24);
        } else if (filters.timeFrame === "7d") {
          startDate.setDate(now.getDate() - 7);
        } else if (filters.timeFrame === "30d") {
          startDate.setDate(now.getDate() - 30);
        }
        clearFilters.startDate = startDate.toISOString();
        clearFilters.endDate = now.toISOString();
      }
      
      if (filters.status !== "all") {
        clearFilters.status = filters.status;
      }
      
      if (filters.arbitrageType !== "all") {
        clearFilters.arbitrageType = filters.arbitrageType;
      }

      const result: any = await apiRequest("POST", "/api/trades/clear", clearFilters);
      
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });

      toast({
        title: "Stats Cleared",
        description: `Successfully cleared ${result.count || 0} trade(s)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear stats",
        variant: "destructive",
      });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      timeFrame: "all",
      status: "all",
      arbitrageType: "all",
    });
  };

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

  const filteredTrades = recentTrades.filter(trade => {
    if (filters.status !== "all" && trade.status !== filters.status) return false;
    if (filters.arbitrageType !== "all" && (trade.path as any).type !== filters.arbitrageType) return false;
    if (filters.timeFrame !== "all") {
      const tradeDate = new Date(trade.timestamp);
      const now = new Date();
      if (filters.timeFrame === "24h") {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        if (tradeDate < yesterday) return false;
      } else if (filters.timeFrame === "7d") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (tradeDate < weekAgo) return false;
      } else if (filters.timeFrame === "30d") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (tradeDate < monthAgo) return false;
      }
    }
    return true;
  });

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

      <AnalyticsChart trades={filteredTrades} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>Filter and manage your trading records</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="timeframe-filter">
                <Calendar className="h-4 w-4 inline mr-2" />
                Time Frame
              </Label>
              <Select
                value={filters.timeFrame}
                onValueChange={(value) => setFilters({ ...filters, timeFrame: value })}
              >
                <SelectTrigger id="timeframe-filter" data-testid="select-timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">
                <Filter className="h-4 w-4 inline mr-2" />
                Status
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger id="status-filter" data-testid="select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="simulated">Simulated</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="backtested">Backtested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-filter">
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Arbitrage Type
              </Label>
              <Select
                value={filters.arbitrageType}
                onValueChange={(value) => setFilters({ ...filters, arbitrageType: value })}
              >
                <SelectTrigger id="type-filter" data-testid="select-arbitrage-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="triangular">Single-Exchange</SelectItem>
                  <SelectItem value="cross-exchange">Cross-Exchange</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="w-full"
                data-testid="button-reset-filters"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={handleClearStats}
              data-testid="button-clear-stats"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Stats
            </Button>
          </div>

          <TradeHistoryTable trades={filteredTrades.slice(0, 20)} />
        </CardContent>
      </Card>
    </div>
  );
}
