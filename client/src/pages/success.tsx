import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Twitter, MessageCircle, ExternalLink, Plus, ArrowLeft } from "lucide-react";
import type { Token } from "@shared/schema";

export default function Success() {
  const params = useParams();
  const tokenId = params.id;

  const { data: token, isLoading } = useQuery<Token>({
    queryKey: ['/api/tokens', tokenId],
    enabled: !!tokenId,
  });

  const handleShare = (platform: 'twitter' | 'telegram') => {
    if (!token) return;
    
    const text = `🚀 Just launched my meme token: ${token.name} (${token.ticker})! Check it out on PumpFun! 🎨`;
    const url = token.pumpfunLink || window.location.href;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="loading-spinner w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading token details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Token Not Found</h1>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 success-animation">
            <Rocket className="text-white text-3xl" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Token Launched Successfully! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">Your meme token is now live on PumpFun</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Meme Preview */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Your Meme</h3>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="w-48 h-48 mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
                  {token.imageUrl ? (
                    <img 
                      src={token.imageUrl} 
                      alt={token.name}
                      className="w-full h-full object-cover"
                      data-testid="img-token-success"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                      <span className="text-6xl">🎨</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-3">Canvas artwork</p>
              </div>
            </CardContent>
          </Card>

          {/* Token Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Token Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium" data-testid="text-token-name">{token.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ticker:</span>
                  <Badge variant="secondary" data-testid="text-token-ticker">${token.ticker}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Chain:</span>
                  <span className="font-medium text-primary">Solana</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Platform:</span>
                  <span className="font-medium text-secondary">PumpFun</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Votes:</span>
                  <span className="font-medium">{token.votes || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {token.createdAt ? new Date(token.createdAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Button
              onClick={() => handleShare('twitter')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90"
              data-testid="button-share-twitter"
            >
              <Twitter className="mr-2" size={20} />
              Share on Twitter
            </Button>
            <Button
              onClick={() => handleShare('telegram')}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:opacity-90"
              data-testid="button-share-telegram"
            >
              <MessageCircle className="mr-2" size={20} />
              Share on Telegram
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {token.pumpfunLink && (
              <Button
                onClick={() => window.open(token.pumpfunLink!, '_blank')}
                className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                data-testid="button-view-pumpfun"
              >
                <ExternalLink className="mr-2" size={20} />
                View on PumpFun
              </Button>
            )}
            <Link href="/gallery">
              <Button variant="outline" className="w-full" data-testid="button-view-gallery">
                <ArrowLeft className="mr-2" size={20} />
                View Gallery
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" className="w-full" data-testid="button-create-another">
                <Plus className="mr-2" size={20} />
                Create Another
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
