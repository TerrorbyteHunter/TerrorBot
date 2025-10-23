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
    enabledPairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "SOL/USDT", "DOGE/USDT", "DOT/USDT", "MATIC/USDT", "ETH/BTC", "BNB/ETH", "SOL/BTC"],
    transferFees: { binance: 0.1, coinbase: 0.15, kraken: 0.12 },
    enableTriangularArbitrage: true,
    autoTradeEnabled: false,
    notificationsEnabled: true,
  });

  useEffect(() => {
    if (settings) {
      setConfig({
        minProfitPercent: settings.minProfitPercent,
        maxExposurePerTrade: settings.maxExposurePerTrade,
        enabledExchanges: settings.enabledExchanges,
        enabledPairs: settings.enabledPairs,
        transferFees: settings.transferFees as Record<string, number>,
        enableTriangularArbitrage: settings.enableTriangularArbitrage,
        autoTradeEnabled: settings.autoTradeEnabled,
        notificationsEnabled: settings.notificationsEnabled,
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
        transferFees: config.transferFees,
        enableTriangularArbitrage: config.enableTriangularArbitrage,
        autoTradeEnabled: config.autoTradeEnabled,
        notificationsEnabled: config.notificationsEnabled,
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
  const usdtPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "SOL/USDT", "DOGE/USDT", "DOT/USDT", "MATIC/USDT"];
  const triangularPairs = ["ETH/BTC", "BNB/ETH", "SOL/BTC"];

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
            <CardTitle>Automation</CardTitle>
            <CardDescription>Configure automated trading and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-trade">Automated Trading</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically execute trades when opportunities are detected
                </p>
              </div>
              <Switch
                id="auto-trade"
                checked={config.autoTradeEnabled}
                onCheckedChange={(checked) => setConfig({ ...config, autoTradeEnabled: checked })}
                data-testid="switch-auto-trade"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive alerts for trades and system events
                </p>
              </div>
              <Switch
                id="notifications"
                checked={config.notificationsEnabled}
                onCheckedChange={(checked) => setConfig({ ...config, notificationsEnabled: checked })}
                data-testid="switch-notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="triangular">Triangular Arbitrage</Label>
                <p className="text-xs text-muted-foreground">
                  Enable single-exchange triangular arbitrage opportunities
                </p>
              </div>
              <Switch
                id="triangular"
                checked={config.enableTriangularArbitrage}
                onCheckedChange={(checked) => setConfig({ ...config, enableTriangularArbitrage: checked })}
                data-testid="switch-triangular"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Fees</CardTitle>
            <CardDescription>Configure transfer fees for cross-exchange arbitrage (%)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exchanges.map((exchange) => (
              <div key={exchange} className="space-y-2">
                <Label htmlFor={`fee-${exchange}`} className="capitalize">
                  {exchange} Transfer Fee (%)
                </Label>
                <Input
                  id={`fee-${exchange}`}
                  type="number"
                  step="0.01"
                  value={config.transferFees[exchange] || 0}
                  onChange={(e) => setConfig({
                    ...config,
                    transferFees: { ...config.transferFees, [exchange]: parseFloat(e.target.value) || 0 }
                  })}
                  data-testid={`input-transfer-fee-${exchange}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

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
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">USDT Pairs (Cross-Exchange)</h3>
              <div className="space-y-3">
                {usdtPairs.map((pair) => (
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
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Cross-Asset Pairs (Triangular Arbitrage)</h3>
              <p className="text-xs text-muted-foreground mb-3">Required for triangular arbitrage within a single exchange</p>
              <div className="space-y-3">
                {triangularPairs.map((pair) => (
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
              </div>
            </div>
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
