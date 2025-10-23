import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, TrendingUp } from "lucide-react";
import { TradeHistoryTable } from "@/components/trade-history-table";
import type { Trade } from "@shared/schema";

export default function Backtesting() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Trade[]>([]);
  const [config, setConfig] = useState({
    initialCapital: "10000",
    days: "7",
    minProfit: "0.5",
  });

  const handleRunBacktest = async () => {
    setIsRunning(true);
    try {
      const response = await apiRequest<{ trades: Trade[] }>("POST", "/api/backtest/run", {
        initialCapital: parseFloat(config.initialCapital),
        days: parseInt(config.days),
        minProfit: parseFloat(config.minProfit),
      });

      setResults(response.trades);
      toast({
        title: "Backtest Complete",
        description: `Simulated ${response.trades.length} trades over ${config.days} days`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run backtest",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const totalProfit = results.reduce((sum, t) => sum + parseFloat(t.profitAmount), 0);
  const winRate = results.length > 0
    ? (results.filter(t => parseFloat(t.profitAmount) > 0).length / results.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backtesting Engine</h1>
        <p className="text-muted-foreground mt-1">
          Simulate trading strategies using historical data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Set up your backtest parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initial-capital">Initial Capital ($)</Label>
              <Input
                id="initial-capital"
                type="number"
                value={config.initialCapital}
                onChange={(e) => setConfig({ ...config, initialCapital: e.target.value })}
                data-testid="input-initial-capital"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Simulation Period (days)</Label>
              <Input
                id="days"
                type="number"
                value={config.days}
                onChange={(e) => setConfig({ ...config, days: e.target.value })}
                data-testid="input-days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-profit">Min Profit Threshold (%)</Label>
              <Input
                id="min-profit"
                type="number"
                step="0.1"
                value={config.minProfit}
                onChange={(e) => setConfig({ ...config, minProfit: e.target.value })}
                data-testid="input-min-profit"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="w-full"
              data-testid="button-run-backtest"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? "Running..." : "Run Backtest"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Performance metrics from the simulation</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Configure and run a backtest to see results
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold font-mono" data-testid="text-total-trades">
                        {results.length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold font-mono text-chart-1" data-testid="text-win-rate">
                        {winRate.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-3xl font-bold font-mono ${
                          totalProfit > 0 ? "text-chart-1" : "text-chart-2"
                        }`}
                        data-testid="text-total-profit"
                      >
                        ${totalProfit.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            <TradeHistoryTable trades={results} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
