'use client';

import { forwardRef } from 'react';
import { useDrawing } from '@/hooks/use-drawing';
import type { DrawingTool } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  tool: DrawingTool;
  strokeColor: string;
  strokeWidth: number;
  canvasColor: string;
  selectionCanvasRef: React.RefObject<HTMLCanvasElement>;
  onAiErase: () => void;
  onColorPick: (color: string) => void;
  onDrawEnd: () => void;
}

const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  (
    { tool, strokeColor, strokeWidth, canvasColor, selectionCanvasRef, onAiErase, onColorPick, onDrawEnd },
    ref
  ) => {
    const { handleMouseDown, handleMouseUp, handleMouseMove, handleMouseLeave } = useDrawing({
      canvasRef: ref as React.RefObject<HTMLCanvasElement>,
      selectionCanvasRef,
      tool,
      strokeColor,
      strokeWidth,
      canvasColor,
      onAiErase,
      onColorPick,
      onDrawEnd,
    });

    return (
      <div className={cn("relative w-full h-full max-w-[1200px] max-h-[800px] aspect-[1.5/1] shadow-2xl rounded-lg overflow-hidden bg-white", tool === 'pipette' && 'cursor-crosshair')}>
        <canvas
          ref={ref}
          className="absolute top-0 left-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={(e) => handleMouseDown(e.touches[0])}
          onTouchMove={(e) => handleMouseMove(e.touches[0])}
          onTouchEnd={handleMouseUp}
        />
         <canvas
          ref={selectionCanvasRef}
          className={cn(
            "absolute top-0 left-0 w-full h-full pointer-events-none",
            tool === 'ai-eraser' ? 'z-10 cursor-crosshair' : 'z-0'
          )}
        />
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
