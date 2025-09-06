import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCanvas } from "@/hooks/use-canvas";
import { Paintbrush, Eraser, Undo2, Trash2 } from "lucide-react";

const colors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", 
  "#3b82f6", "#a855f7", "#ec4899", "#111827",
  "#6b7280", "#06b6d4", "#6366f1", "#10b981"
];

interface DrawingCanvasProps {
  onImageChange?: (hasImage: boolean) => void;
}

export default function DrawingCanvas({ onImageChange }: DrawingCanvasProps) {
  const {
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
  } = useCanvas();

  const handleToolChange = (tool: 'brush' | 'eraser') => {
    setIsErasing(tool === 'eraser');
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (isErasing) {
      setIsErasing(false);
    }
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSize(parseInt(event.target.value));
  };

  const handleUndo = () => {
    undo();
    onImageChange?.(!isEmpty());
  };

  const handleClear = () => {
    clear();
    onImageChange?.(false);
  };

  // Expose getImageDataURL for parent components
  (DrawingCanvas as any).getImageDataURL = getImageDataURL;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-2xl p-6 canvas-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">Draw Your Meme</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>500×500px</span>
          </div>
        </div>
        
        {/* Canvas Container */}
        <div className="relative bg-gray-50 rounded-xl p-2 sm:p-4 mb-6">
          <canvas 
            ref={canvasRef}
            width="500" 
            height="500" 
            className="border-2 border-dashed border-gray-300 rounded-lg mx-auto bg-white cursor-crosshair max-w-full h-auto touch-manipulation"
            style={{ width: 'min(100%, 500px)', height: 'min(100%, 500px)' }}
            data-testid="canvas-drawing"
          />
        </div>

        {/* Drawing Toolbar */}
        <div className="floating-toolbar rounded-xl p-3 sm:p-4 border">
          {/* Mobile-optimized layout */}
          <div className="space-y-4">
            {/* Top row: Tools and Actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Brush Tools */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={!isErasing ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolChange('brush')}
                  data-testid="button-brush"
                  className="min-h-[44px] min-w-[44px]"
                >
                  <Paintbrush size={18} />
                </Button>
                <Button
                  variant={isErasing ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolChange('eraser')}
                  data-testid="button-eraser"
                  className="min-h-[44px] min-w-[44px]"
                >
                  <Eraser size={18} />
                </Button>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  data-testid="button-undo"
                  className="min-h-[44px]"
                >
                  <Undo2 size={16} className="sm:mr-2" />
                  <span className="hidden sm:inline">Undo</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClear}
                  data-testid="button-clear"
                  className="min-h-[44px]"
                >
                  <Trash2 size={16} className="sm:mr-2" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </div>
            </div>

            {/* Bottom row: Colors and Size */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Color Palette */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Colors:</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {colors.map((color, index) => (
                    <button
                      key={color}
                      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform touch-manipulation ${
                        currentColor === color ? 'ring-4 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                      data-testid={`button-color-${index}`}
                    />
                  ))}
                </div>
              </div>

              {/* Brush Size */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-muted-foreground">Size:</label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={currentSize}
                  onChange={handleSizeChange}
                  className="w-16 sm:w-20 touch-manipulation"
                  data-testid="slider-brush-size"
                />
                <span className="text-sm font-medium text-foreground min-w-[2rem] text-center">{currentSize}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
