import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Trash2, CheckCircle2, XCircle, Link as LinkIcon } from "lucide-react";
import type { ExchangeConnection } from "@shared/schema";

export default function ExchangesPage() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [exchangeName, setExchangeName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const { data: connections = [], isLoading } = useQuery<ExchangeConnection[]>({
    queryKey: ["/api/exchange-connections"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { exchangeName: string; apiKey: string; apiSecret: string }) => {
      return await apiRequest("/api/exchange-connections", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchange-connections"] });
      toast({
        title: "Exchange Connected",
        description: "Successfully connected to exchange",
      });
      setShowForm(false);
      setExchangeName("");
      setApiKey("");
      setApiSecret("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/exchange-connections/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchange-connections"] });
      toast({
        title: "Exchange Removed",
        description: "Exchange connection has been deleted",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({ exchangeName, apiKey, apiSecret });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-title">Exchange Connections</h1>
          <p className="text-muted-foreground">Manage your exchange API connections</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          data-testid="button-add-exchange"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exchange
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Exchange Connection</CardTitle>
            <CardDescription>
              Enter your API credentials to connect an exchange
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exchangeName">Exchange Name</Label>
                <Input
                  id="exchangeName"
                  placeholder="e.g., binance, coinbase, kraken"
                  value={exchangeName}
                  onChange={(e) => setExchangeName(e.target.value)}
                  required
                  data-testid="input-exchange-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                  data-testid="input-api-key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="Your API secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  required
                  data-testid="input-api-secret"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addMutation.isPending} data-testid="button-submit-exchange">
                  {addMutation.isPending ? "Connecting..." : "Connect Exchange"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  data-testid="button-cancel-exchange"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">Loading exchanges...</div>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LinkIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Exchange Connections</h3>
            <p className="text-muted-foreground mb-4">
              Connect your first exchange to start trading
            </p>
            <Button onClick={() => setShowForm(true)} data-testid="button-add-first-exchange">
              <Plus className="w-4 h-4 mr-2" />
              Add Exchange
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {connections.map((connection) => (
            <Card key={connection.id} data-testid={`card-exchange-${connection.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {connection.exchangeName}
                      {connection.isActive ? (
                        <Badge variant="default" data-testid={`badge-status-${connection.id}`}>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" data-testid={`badge-status-${connection.id}`}>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Connected on {new Date(connection.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(connection.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${connection.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">API Key:</span>
                    <span className="font-mono">***{connection.apiKey.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{connection.connectionStatus}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
