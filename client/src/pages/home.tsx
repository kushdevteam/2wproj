import { useState, useEffect } from "react";
import Header from "@/components/header";
import DrawingCanvas from "@/components/drawing-canvas";
import TokenForm from "@/components/token-form";
import BuyButton from "@/components/buy-button";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

export default function Home() {
  const [canvasHasImage, setCanvasHasImage] = useState(false);
  const { isTelegramWebApp, telegramUser, showMainButton, hideMainButton } = useTelegramWebApp();

  const getCanvasImage = () => {
    return (DrawingCanvas as any).getImageDataURL?.() || null;
  };

  // Set up Telegram Web App main button
  useEffect(() => {
    if (isTelegramWebApp && canvasHasImage) {
      showMainButton("Create Token", () => {
        // Simulate form submission
        const createButton = document.querySelector('[data-testid="button-create-token"]') as HTMLButtonElement;
        if (createButton) {
          createButton.click();
        }
      });
    } else if (isTelegramWebApp) {
      hideMainButton();
    }
    
    return () => {
      if (isTelegramWebApp) {
        hideMainButton();
      }
    };
  }, [isTelegramWebApp, canvasHasImage, showMainButton, hideMainButton]);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Create Your Meme Token
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Draw your meme, give it a name and ticker, then launch it instantly on PumpFun. 
            No wallet connection required — just creativity and fun!
          </p>
          
          {/* Special Telegram welcome */}
          {isTelegramWebApp && telegramUser && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
              <p className="text-blue-800 font-medium">
                Welcome {telegramUser.first_name}! 👋
              </p>
              <p className="text-blue-600 text-sm mt-1">
                You're using the Telegram Web App version
              </p>
            </div>
          )}
        </div>

        {/* Buy Token Section for non-Telegram users or as featured section */}
        {!isTelegramWebApp && (
          <div className="mb-12 max-w-md mx-auto">
            <BuyButton variant="large" />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          {/* Drawing Section */}
          <div className="order-1">
            <DrawingCanvas 
              onImageChange={setCanvasHasImage}
            />
          </div>

          {/* Token Details Section */}
          <div className="order-2 lg:order-2">
            <TokenForm 
              getCanvasImage={getCanvasImage}
              canvasHasImage={canvasHasImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
