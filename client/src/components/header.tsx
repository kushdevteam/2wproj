import { Link, useLocation } from "wouter";
import { Palette, Rocket, UserPlus, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import BuyButton from "@/components/buy-button";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Palette className="text-white text-sm" size={16} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Draw Your Meme
            </h1>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <span className="text-lg font-semibold text-muted-foreground">
              Draw → Name → Launch
            </span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <BuyButton variant="compact" />
            
            <Link href="/gallery">
              <Button 
                variant={location === "/gallery" ? "default" : "secondary"}
                className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                data-testid="button-gallery"
              >
                <Rocket className="mr-2" size={16} />
                <span className="hidden sm:inline">Gallery</span>
              </Button>
            </Link>
            
            {/* Authentication Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground hidden sm:block">
                    {user?.solanaAddress?.slice(0, 4)}...{user?.solanaAddress?.slice(-4)}
                  </span>
                  {user?.isVerified === "true" && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut size={14} className="mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" data-testid="button-login-header">
                    <LogIn size={14} className="mr-1" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                    data-testid="button-register-header"
                  >
                    <UserPlus size={14} className="mr-1" />
                    <span className="hidden sm:inline">Register</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
