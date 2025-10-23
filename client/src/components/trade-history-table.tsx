import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Trade } from "@shared/schema";

type TradeHistoryTableProps = {
  trades: Trade[];
};

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Path</TableHead>
            <TableHead className="text-right">Initial</TableHead>
            <TableHead className="text-right">Final</TableHead>
            <TableHead className="text-right">Profit %</TableHead>
            <TableHead className="text-right">Profit Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No trades yet. Start by executing arbitrage opportunities.
              </TableCell>
            </TableRow>
          ) : (
            trades.map((trade, index) => (
              <TableRow key={trade.id} data-testid={`row-trade-${index}`}>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="text-sm">
                  {trade.path.exchanges.join(" → ")}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  ${parseFloat(trade.initialAmount).toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  ${parseFloat(trade.finalAmount).toFixed(2)}
                </TableCell>
                <TableCell
                  className={`text-right font-mono text-sm font-medium ${
                    parseFloat(trade.profitPercent) > 0 ? "text-chart-1" : "text-chart-2"
                  }`}
                  data-testid={`text-profit-percent-${index}`}
                >
                  {parseFloat(trade.profitPercent) > 0 ? "+" : ""}
                  {parseFloat(trade.profitPercent).toFixed(2)}%
                </TableCell>
                <TableCell
                  className={`text-right font-mono text-sm font-medium ${
                    parseFloat(trade.profitAmount) > 0 ? "text-chart-1" : "text-chart-2"
                  }`}
                >
                  {parseFloat(trade.profitAmount) > 0 ? "+" : ""}$
                  {parseFloat(trade.profitAmount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={trade.status === "simulated" ? "secondary" : "default"}
                    data-testid={`badge-status-${index}`}
                  >
                    {trade.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
