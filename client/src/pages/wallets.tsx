import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Wallet as WalletIcon } from "lucide-react";
import type { Wallet, ExchangeConnection } from "@shared/schema";

export default function WalletsPage() {
  const { toast } = useToast();

  const { data: wallets = [], isLoading: walletsLoading } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const { data: connections = [] } = useQuery<ExchangeConnection[]>({
    queryKey: ["/api/exchange-connections"],
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/wallets/refresh", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({
        title: "Wallets Refreshed",
        description: "Wallet balances have been updated",
      });
    },
  });

  const getExchangeName = (exchangeConnectionId: string) => {
    const connection = connections.find((c) => c.id === exchangeConnectionId);
    return connection?.exchangeName || "Unknown";
  };

  const walletsByExchange = wallets.reduce((acc, wallet) => {
    const exchangeName = getExchangeName(wallet.exchangeConnectionId);
    if (!acc[exchangeName]) {
      acc[exchangeName] = [];
    }
    acc[exchangeName].push(wallet);
    return acc;
  }, {} as Record<string, Wallet[]>);

  const totalBalance = wallets.reduce((sum, wallet) => {
    return sum + parseFloat(wallet.balance);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-title">Wallets</h1>
          <p className="text-muted-foreground">Monitor your exchange wallet balances</p>
        </div>
        <Button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending || connections.length === 0}
          data-testid="button-refresh-wallets"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
          Refresh Balances
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Total Balance (USD)</CardDescription>
            <CardTitle className="text-2xl" data-testid="text-total-balance">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Connected Exchanges</CardDescription>
            <CardTitle className="text-2xl" data-testid="text-exchange-count">
              {Object.keys(walletsByExchange).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Total Wallets</CardDescription>
            <CardTitle className="text-2xl" data-testid="text-wallet-count">
              {wallets.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {walletsLoading ? (
        <div className="text-center py-12">Loading wallets...</div>
      ) : wallets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <WalletIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Wallets Found</h3>
            <p className="text-muted-foreground mb-4">
              Connect an exchange and refresh to see your wallets
            </p>
            <Button
              onClick={() => refreshMutation.mutate()}
              disabled={connections.length === 0}
              data-testid="button-refresh-first"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Wallets
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(walletsByExchange).map(([exchangeName, exchangeWallets]) => (
            <Card key={exchangeName}>
              <CardHeader>
                <CardTitle className="capitalize">{exchangeName}</CardTitle>
                <CardDescription>
                  {exchangeWallets.length} wallet{exchangeWallets.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {exchangeWallets.map((wallet) => (
                    <Card key={wallet.id} data-testid={`card-wallet-${wallet.id}`}>
                      <CardHeader className="space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {wallet.currency}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <div className="text-2xl font-bold" data-testid={`text-balance-${wallet.id}`}>
                          {parseFloat(wallet.balance).toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Available: {parseFloat(wallet.available).toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Locked: {parseFloat(wallet.locked).toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Updated: {new Date(wallet.lastUpdated).toLocaleTimeString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
