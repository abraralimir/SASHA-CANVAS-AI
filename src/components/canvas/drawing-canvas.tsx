'use client';

import { forwardRef, useCallback } from 'react';
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
    
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
      // e.preventDefault(); // This can prevent scroll on touch but might interfere with other touch features.
      handleMouseDown(e.touches[0]);
    }, [handleMouseDown]);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
      // Prevent scrolling while drawing on mobile
      e.preventDefault();
      handleMouseMove(e.touches[0]);
    }, [handleMouseMove]);


    return (
      <div className={cn("relative w-full h-full max-w-[1200px] max-h-[800px] aspect-[1.5/1] shadow-2xl rounded-lg overflow-hidden bg-white touch-none", tool === 'pipette' && 'cursor-crosshair')}>
        <canvas
          ref={ref}
          className="absolute top-0 left-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
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
