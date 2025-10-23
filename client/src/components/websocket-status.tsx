import { Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WebSocketStatusProps = {
  connected: boolean;
};

export function WebSocketStatus({ connected }: WebSocketStatusProps) {
  return (
    <Badge
      variant={connected ? "default" : "secondary"}
      className="gap-2"
      data-testid="status-websocket"
    >
      <Circle
        className={`h-2 w-2 fill-current ${connected ? "text-chart-1" : "text-muted-foreground"}`}
      />
      <span className="text-xs font-medium">
        {connected ? "Live" : "Disconnected"}
      </span>
    </Badge>
  );
}
