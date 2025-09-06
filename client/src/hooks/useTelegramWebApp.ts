import { useEffect, useState } from 'react';

interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegramWebApp() {
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    // Check if running in Telegram Web App
    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        setIsTelegramWebApp(true);
        setWebApp(tg);
        setTelegramUser(tg.initDataUnsafe.user || null);
        
        // Initialize Telegram Web App
        tg.ready();
        
        // Expand to full height
        tg.expand();
        
        // Set theme for dark mode support
        if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
        
        return true;
      }
      return false;
    };

    // Try immediate check
    if (!checkTelegram()) {
      // If not immediately available, wait a bit and try again
      const timeout = setTimeout(checkTelegram, 100);
      return () => clearTimeout(timeout);
    }
  }, []);

  const showMainButton = (text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  };

  const showBackButton = (onClick: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  };

  const closeTelegramApp = () => {
    if (webApp) {
      webApp.close();
    }
  };

  return {
    isTelegramWebApp,
    telegramUser,
    webApp,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    closeTelegramApp,
  };
}