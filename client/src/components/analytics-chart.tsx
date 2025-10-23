import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { Trade } from "@shared/schema";

type AnalyticsChartProps = {
  trades: Trade[];
};

export function AnalyticsChart({ trades }: AnalyticsChartProps) {
  const recentTrades = trades.slice(0, 20).reverse();
  const chartData = recentTrades.map((trade, index) => {
    const cumulativeProfit = recentTrades
      .slice(0, index + 1)
      .reduce((sum, t) => sum + parseFloat(t.profitAmount), 0);

    return {
      name: new Date(trade.timestamp).toLocaleTimeString(),
      profit: parseFloat(trade.profitAmount),
      cumulative: cumulativeProfit,
    };
  });

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Profit Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No trade data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Profit Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#colorProfit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
