import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type KPICardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
};

export function KPICard({ title, value, icon: Icon, description, trend = "neutral" }: KPICardProps) {
  const trendColor =
    trend === "up" ? "text-chart-1" : trend === "down" ? "text-chart-2" : "text-foreground";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold font-mono ${trendColor}`} data-testid={`text-kpi-${title.toLowerCase().replace(/\s+/g, "-")}`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
