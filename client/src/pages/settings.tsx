import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const [config, setConfig] = useState({
    minProfitPercent: "0.5",
    maxExposurePerTrade: "1000",
    enabledExchanges: ["binance", "coinbase", "kraken"],
    enabledPairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT"],
  });

  useEffect(() => {
    if (settings) {
      setConfig({
        minProfitPercent: settings.minProfitPercent,
        maxExposurePerTrade: settings.maxExposurePerTrade,
        enabledExchanges: settings.enabledExchanges,
        enabledPairs: settings.enabledPairs,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await apiRequest("PUT", "/api/settings", {
        minProfitPercent: config.minProfitPercent,
        maxExposurePerTrade: config.maxExposurePerTrade,
        enabledExchanges: config.enabledExchanges,
        enabledPairs: config.enabledPairs,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });

      toast({
        title: "Settings Saved",
        description: "Your configuration has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const exchanges = ["binance", "coinbase", "kraken"];
  const pairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "ADA/USDT"];

  const toggleExchange = (exchange: string) => {
    setConfig((prev) => ({
      ...prev,
      enabledExchanges: prev.enabledExchanges.includes(exchange)
        ? prev.enabledExchanges.filter((e) => e !== exchange)
        : [...prev.enabledExchanges, exchange],
    }));
  };

  const togglePair = (pair: string) => {
    setConfig((prev) => ({
      ...prev,
      enabledPairs: prev.enabledPairs.includes(pair)
        ? prev.enabledPairs.filter((p) => p !== pair)
        : [...prev.enabledPairs, pair],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure risk parameters and trading preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Management</CardTitle>
            <CardDescription>Set profit thresholds and exposure limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-profit">Minimum Profit Threshold (%)</Label>
              <Input
                id="min-profit"
                type="number"
                step="0.1"
                value={config.minProfitPercent}
                onChange={(e) => setConfig({ ...config, minProfitPercent: e.target.value })}
                data-testid="input-min-profit-threshold"
              />
              <p className="text-xs text-muted-foreground">
                Only execute trades with profit above this percentage
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-exposure">Maximum Exposure Per Trade ($)</Label>
              <Input
                id="max-exposure"
                type="number"
                value={config.maxExposurePerTrade}
                onChange={(e) => setConfig({ ...config, maxExposurePerTrade: e.target.value })}
                data-testid="input-max-exposure"
              />
              <p className="text-xs text-muted-foreground">
                Maximum amount to risk on a single trade
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enabled Exchanges</CardTitle>
            <CardDescription>Select exchanges to monitor for opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {exchanges.map((exchange) => (
              <div key={exchange} className="flex items-center justify-between">
                <Label htmlFor={`exchange-${exchange}`} className="capitalize">
                  {exchange}
                </Label>
                <Switch
                  id={`exchange-${exchange}`}
                  checked={config.enabledExchanges.includes(exchange)}
                  onCheckedChange={() => toggleExchange(exchange)}
                  data-testid={`switch-exchange-${exchange}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trading Pairs</CardTitle>
            <CardDescription>Select currency pairs to monitor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pairs.map((pair) => (
              <div key={pair} className="flex items-center justify-between">
                <Label htmlFor={`pair-${pair}`} className="font-mono text-sm">
                  {pair}
                </Label>
                <Switch
                  id={`pair-${pair}`}
                  checked={config.enabledPairs.includes(pair)}
                  onCheckedChange={() => togglePair(pair)}
                  data-testid={`switch-pair-${pair}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Save Configuration</CardTitle>
            <CardDescription>Apply your changes to the trading bot</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Changes will take effect immediately and apply to all future trades and opportunities.
            </p>
            <Button onClick={handleSave} className="w-full" data-testid="button-save-settings">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
