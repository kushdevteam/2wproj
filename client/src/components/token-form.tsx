import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoadingModal from "@/components/loading-modal";
import { useLocation } from "wouter";
import type { Token } from "@shared/schema";

const tokenFormSchema = z.object({
  name: z.string().min(1, "Token name is required").max(50, "Token name too long"),
  ticker: z.string().min(2, "Ticker must be at least 2 characters").max(10, "Ticker too long").transform(s => s.toUpperCase()),
});

type TokenFormData = z.infer<typeof tokenFormSchema>;

interface TokenFormProps {
  getCanvasImage: () => string | null;
  canvasHasImage: boolean;
}

export default function TokenForm({ getCanvasImage, canvasHasImage }: TokenFormProps) {
  const [, setLocation] = useLocation();
  const [isLaunching, setIsLaunching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TokenFormData>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: "",
      ticker: "",
    },
  });

  // Fetch recent tokens
  const { data: recentTokens = [] } = useQuery<Token[]>({
    queryKey: ['/api/tokens/recent'],
  });

  const launchMutation = useMutation({
    mutationFn: async (data: TokenFormData) => {
      const imageDataURL = getCanvasImage();
      if (!imageDataURL) {
        throw new Error("No canvas image available");
      }

      // Convert data URL to blob
      const response = await fetch(imageDataURL);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'meme.png');
      formData.append('name', data.name);
      formData.append('ticker', data.ticker);

      const res = await fetch('/api/tokens/launch', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to launch token');
      }

      return res.json();
    },
    onSuccess: (data: Token) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      setIsLaunching(false);
      setLocation(`/success/${data.id}`);
      toast({
        title: "Token Launched! 🚀",
        description: `${data.name} (${data.ticker}) is now live!`,
      });
    },
    onError: (error: Error) => {
      setIsLaunching(false);
      toast({
        title: "Launch Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TokenFormData) => {
    if (!canvasHasImage) {
      toast({
        title: "No Drawing",
        description: "Please draw your meme first!",
        variant: "destructive",
      });
      return;
    }

    setIsLaunching(true);
    launchMutation.mutate(data);
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Token Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Token Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Doge to the Moon"
                  {...form.register("name")}
                  className="mt-2"
                  data-testid="input-token-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Choose a catchy name for your meme token</p>
              </div>

              <div>
                <Label htmlFor="ticker" className="text-sm font-semibold text-foreground">
                  Token Ticker <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ticker"
                  placeholder="e.g., MOON"
                  {...form.register("ticker")}
                  className="mt-2 uppercase"
                  maxLength={10}
                  data-testid="input-token-ticker"
                />
                {form.formState.errors.ticker && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.ticker.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Short symbol (2-10 characters)</p>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <Info className="text-primary mr-2" size={16} />
                  How it works
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your meme will be saved as the token image</li>
                  <li>• Token deployed instantly on PumpFun</li>
                  <li>• No wallet connection required</li>
                  <li>• Share your creation on social media</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-white py-4 px-6 text-lg font-bold hover:scale-105 transition-all shadow-2xl hover:shadow-primary/25"
                disabled={isLaunching || !canvasHasImage}
                data-testid="button-launch-token"
              >
                <Rocket className="mr-3" size={20} />
                Launch Token 🚀
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Launches Preview */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Recent Launches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTokens.slice(0, 3).map((token: Token, index: number) => (
                <div key={token.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center overflow-hidden">
                    {token.imageUrl ? (
                      <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold">🎨</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{token.name}</p>
                    <p className="text-xs text-muted-foreground">${token.ticker}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {token.createdAt ? new Date(token.createdAt).toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
              {recentTokens.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No tokens launched yet. Be the first!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <LoadingModal isOpen={isLaunching} />
    </>
  );
}
