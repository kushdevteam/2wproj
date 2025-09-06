import { useRef, useEffect, useState } from "react";

declare global {
  interface Window {
    fabric: any;
  }
}

interface CanvasHook {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: any;
  currentColor: string;
  currentSize: number;
  isErasing: boolean;
  setCurrentColor: (color: string) => void;
  setCurrentSize: (size: number) => void;
  setIsErasing: (erasing: boolean) => void;
  undo: () => void;
  clear: () => void;
  getImageDataURL: () => string | null;
  isEmpty: () => boolean;
}

export function useCanvas(): CanvasHook {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentSize, setCurrentSize] = useState(5);
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    // Load Fabric.js dynamically
    const loadFabric = async () => {
      if (typeof window !== "undefined" && !window.fabric) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js";
        script.onload = initCanvas;
        document.head.appendChild(script);
      } else if (window.fabric) {
        initCanvas();
      }
    };

    const initCanvas = () => {
      if (canvasRef.current && window.fabric) {
        const fabricCanvas = new window.fabric.Canvas(canvasRef.current, {
          isDrawingMode: true,
          width: 500,
          height: 500,
        });

        fabricCanvas.freeDrawingBrush.width = currentSize;
        fabricCanvas.freeDrawingBrush.color = currentColor;
        fabricCanvas.setBackgroundColor('#ffffff', fabricCanvas.renderAll.bind(fabricCanvas));

        setCanvas(fabricCanvas);
      }
    };

    loadFabric();

    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (canvas) {
      if (isErasing) {
        // Use white color for erasing effect
        canvas.freeDrawingBrush = new window.fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = currentSize * 2;
        canvas.freeDrawingBrush.color = '#ffffff';
      } else {
        canvas.freeDrawingBrush = new window.fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = currentSize;
        canvas.freeDrawingBrush.color = currentColor;
      }
    }
  }, [canvas, currentColor, currentSize, isErasing]);

  const undo = () => {
    if (canvas) {
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        canvas.remove(objects[objects.length - 1]);
        canvas.renderAll();
      }
    }
  };

  const clear = () => {
    if (canvas) {
      canvas.clear();
      canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
    }
  };

  const getImageDataURL = (): string | null => {
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return null;
  };

  const isEmpty = (): boolean => {
    if (canvas) {
      return canvas.isEmpty();
    }
    return true;
  };

  return {
    canvasRef,
    canvas,
    currentColor,
    currentSize,
    isErasing,
    setCurrentColor,
    setCurrentSize,
    setIsErasing,
    undo,
    clear,
    getImageDataURL,
    isEmpty,
  };
}
