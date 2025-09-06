import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface LoadingModalProps {
  isOpen: boolean;
}

export default function LoadingModal({ isOpen }: LoadingModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 15 + 5;
          const newProgress = prev + increment;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md mx-4 text-center" data-testid="modal-loading">
        <div className="loading-spinner w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Launching Your Token!</h3>
        <p className="text-muted-foreground mb-4">Deploying to PumpFun and saving your meme...</p>
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress:</span>
            <span data-testid="text-progress">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" data-testid="progress-launch" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
