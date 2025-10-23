import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import type { ArbitragePath } from "@shared/schema";

type OpportunityCardProps = {
  id: string;
  path: ArbitragePath;
  profitPercent: number;
  timestamp: number;
  onExecute?: (id: string) => void;
};

export function OpportunityCard({
  id,
  path,
  profitPercent,
  timestamp,
  onExecute,
}: OpportunityCardProps) {
  const isProfitable = profitPercent > 0;
  const isTriangular = path.type === "triangular";
  const totalTransferFees = path.transferFees?.reduce((a, b) => a + b, 0) || 0;

  return (
    <Card
      data-testid={`card-opportunity-${id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className={`h-4 w-4 ${isProfitable ? "text-chart-1" : "text-chart-2"}`} />
          <span className="text-sm font-medium">
            {isTriangular ? "Triangular Arbitrage" : "Cross-Exchange Arbitrage"}
          </span>
        </div>
        <Badge
          variant={isProfitable ? "default" : "secondary"}
          className={isProfitable ? "bg-chart-1" : ""}
          data-testid={`badge-profit-${id}`}
        >
          {isProfitable ? "+" : ""}{profitPercent.toFixed(2)}%
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          {path.exchanges.map((exchange, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="font-mono text-xs mb-1">
                  {exchange.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">{path.pairs[index]}</span>
                <span className="text-sm font-mono font-medium mt-1" data-testid={`text-step-price-${index}`}>
                  ${path.prices[index].toFixed(2)}
                </span>
              </div>
              {index < path.exchanges.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground">
            Detected at {new Date(timestamp).toLocaleTimeString()}
          </div>
          {!isTriangular && totalTransferFees > 0 && (
            <div className="text-xs text-muted-foreground">
              Transfer fees: {totalTransferFees.toFixed(2)}% ({path.transferFees?.map((fee, idx) => 
                `${path.exchanges[idx]}: ${fee.toFixed(2)}%`
              ).join(", ")})
            </div>
          )}
          {isTriangular && (
            <div className="text-xs text-muted-foreground">
              Single exchange - No transfer delays
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onExecute?.(id)}
          className="w-full"
          variant={isProfitable ? "default" : "secondary"}
          data-testid={`button-execute-${id}`}
        >
          Simulate Trade
        </Button>
      </CardFooter>
    </Card>
  );
}
