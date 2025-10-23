import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PriceCardProps = {
  exchange: string;
  symbol: string;
  price: number;
  change?: number;
  timestamp?: number;
};

export function PriceCard({ exchange, symbol, price, change = 0, timestamp }: PriceCardProps) {
  const isPositive = change >= 0;
  const formattedPrice = price.toFixed(2);
  const formattedChange = Math.abs(change).toFixed(2);

  return (
    <Card data-testid={`card-price-${exchange}-${symbol}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {exchange.toUpperCase()}
          </Badge>
          <span className="text-sm font-medium text-foreground">{symbol}</span>
        </div>
        {change !== 0 && (
          <div className={`flex items-center gap-1 ${isPositive ? "text-chart-1" : "text-chart-2"}`}>
            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span className="text-xs font-mono font-medium">
              {isPositive ? "+" : "-"}{formattedChange}%
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-bold font-mono tabular-nums" data-testid={`text-price-${exchange}-${symbol}`}>
            ${formattedPrice}
          </p>
          {timestamp && (
            <p className="text-xs text-muted-foreground">
              {new Date(timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
