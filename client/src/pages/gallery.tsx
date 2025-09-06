import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, TrendingUp, Clock, Vote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BuyButton from "@/components/buy-button";
import type { Token } from "@shared/schema";

export default function Gallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [votedTokens, setVotedTokens] = useState<Set<string>>(new Set());

  const { data: allTokens = [], isLoading: allLoading } = useQuery<Token[]>({
    queryKey: ['/api/tokens'],
  });

  const { data: trendingTokens = [], isLoading: trendingLoading } = useQuery<Token[]>({
    queryKey: ['/api/tokens/trending'],
  });

  const voteMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      const res = await apiRequest('POST', `/api/tokens/${tokenId}/vote`);
      return res.json();
    },
    onSuccess: (data, tokenId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      setVotedTokens(prev => new Set([...Array.from(prev), tokenId]));
      toast({
        title: "Vote Added! 👍",
        description: "Thanks for supporting this meme token!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Vote Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVote = (tokenId: string) => {
    if (votedTokens.has(tokenId)) {
      toast({
        title: "Already Voted",
        description: "You've already voted for this token!",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate(tokenId);
  };

  const handleShare = (token: Token, platform: 'twitter' | 'telegram') => {
    const text = `Check out my new meme token: ${token.name} (${token.ticker})! 🚀`;
    const url = token.pumpfunLink || window.location.href;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const TokenCard = ({ token }: { token: Token }) => (
    <Card className="meme-card-hover" data-testid={`card-token-${token.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {token.imageUrl ? (
              <img 
                src={token.imageUrl} 
                alt={token.name} 
                className="w-full h-full object-cover"
                data-testid={`img-token-${token.id}`}
              />
            ) : (
              <span className="text-2xl">🎨</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-foreground truncate" data-testid={`text-name-${token.id}`}>
                  {token.name}
                </h3>
                <Badge variant="secondary" data-testid={`text-ticker-${token.id}`}>
                  ${token.ticker}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(token.id)}
                  disabled={votedTokens.has(token.id) || voteMutation.isPending}
                  data-testid={`button-vote-${token.id}`}
                >
                  <Vote size={16} className={votedTokens.has(token.id) ? "text-primary" : ""} />
                  <span className="ml-1">{token.votes || 0}</span>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mb-3">
              <Clock size={12} className="mr-1" />
              {token.createdAt ? new Date(token.createdAt).toLocaleString() : 'Just now'}
            </div>
            
            <div className="flex items-center space-x-2">
              {token.pumpfunLink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(token.pumpfunLink!, '_blank')}
                  data-testid={`button-pumpfun-${token.id}`}
                >
                  <ExternalLink size={14} className="mr-1" />
                  PumpFun
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare(token, 'twitter')}
                data-testid={`button-share-twitter-${token.id}`}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Meme Token Gallery
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing meme tokens created by our community. Vote for your favorites!
          </p>
        </div>

        {/* Featured Buy Button */}
        <div className="mb-8 max-w-md mx-auto">
          <BuyButton variant="large" />
        </div>

        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="recent" className="flex items-center" data-testid="tab-recent">
              <Clock size={16} className="mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center" data-testid="tab-trending">
              <TrendingUp size={16} className="mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-6">
            {allLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allTokens.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No tokens launched yet. Be the first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTokens.map((token: Token) => (
                  <TokenCard key={token.id} token={token} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            {trendingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : trendingTokens.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No tokens have votes yet. Start voting!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTokens.map((token: Token) => (
                  <TokenCard key={token.id} token={token} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
