import { Button } from "@/components/ui/button";
import { ExternalLink, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BuyButtonProps {
  variant?: 'default' | 'large' | 'compact';
  className?: string;
}

export default function BuyButton({ variant = 'default', className = '' }: BuyButtonProps) {
  const handleBuyClick = () => {
    // Mock PumpFun link for the main DrawYourMeme token
    const pumpfunUrl = "https://pump.fun/coin/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
    window.open(pumpfunUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'compact') {
    return (
      <Button
        onClick={handleBuyClick}
        size="sm"
        className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 ${className}`}
        data-testid="button-buy-compact"
      >
        <DollarSign size={14} className="mr-1" />
        Buy $DRAW
      </Button>
    );
  }

  if (variant === 'large') {
    return (
      <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <TrendingUp className="mr-2 text-green-600" size={20} />
              DrawYourMeme Token
            </h3>
            <p className="text-sm text-gray-600">Official platform token</p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            $DRAW
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Market Cap</p>
            <p className="font-bold text-sm">$2.5M</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Holders</p>
            <p className="font-bold text-sm">1,247</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="font-bold text-sm text-green-600">↗ $0.024</p>
          </div>
        </div>

        <Button
          onClick={handleBuyClick}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 text-lg py-4 font-bold"
          data-testid="button-buy-large"
        >
          <DollarSign className="mr-2" size={20} />
          Buy $DRAW Token
          <ExternalLink className="ml-2" size={16} />
        </Button>

        <p className="text-xs text-gray-500 text-center mt-2">
          Powered by PumpFun • Trade safely
        </p>
      </div>
    );
  }

  // Default variant
  return (
    <Button
      onClick={handleBuyClick}
      className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 ${className}`}
      data-testid="button-buy-default"
    >
      <DollarSign className="mr-2" size={16} />
      Buy $DRAW Token
      <ExternalLink className="ml-2" size={14} />
    </Button>
  );
}