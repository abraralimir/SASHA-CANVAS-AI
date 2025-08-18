'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { DrawingTool, Point } from '@/lib/types';

interface UseDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selectionCanvasRef: React.RefObject<HTMLCanvasElement>;
  tool: DrawingTool;
  strokeColor: string;
  strokeWidth: number;
  canvasColor: string;
  onAiErase: () => void;
  onColorPick: (color: string) => void;
  onDrawEnd: () => void;
}

export function useDrawing({
  canvasRef,
  selectionCanvasRef,
  tool,
  strokeColor,
  strokeWidth,
  canvasColor,
  onAiErase,
  onColorPick,
  onDrawEnd,
}: UseDrawingProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const startPoint = useRef<Point | null>(null);
  const snapshot = useRef<ImageData | null>(null);

  const getCanvasContext = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      return canvas?.getContext('2d');
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCanvasContext(canvas);
    if (!ctx) return;
    
    // Set the background color, user can clear explicitly.
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onDrawEnd();
  }, [canvasColor, canvasRef, getCanvasContext, onDrawEnd]);


  const resizeCanvases = useCallback(() => {
    const canvas = canvasRef.current;
    const selectionCanvas = selectionCanvasRef.current;
    if (!canvas || !selectionCanvas) return;

    const mainCtx = getCanvasContext(canvas);
    if (!mainCtx) return;
    
    // Save drawing from main canvas
    const drawing = mainCtx.getImageData(0, 0, canvas.width, canvas.height);
    
    const { width, height } = canvas.getBoundingClientRect();
    
    // Resize both canvases
    canvas.width = width;
    canvas.height = height;
    selectionCanvas.width = width;
    selectionCanvas.height = height;

    // Restore drawing to main canvas
    mainCtx.putImageData(drawing, 0, 0);

  }, [canvasRef, selectionCanvasRef, getCanvasContext]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const selectionCanvas = selectionCanvasRef.current;
    if (!canvas || !selectionCanvas) return;

    // Initial sizing
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    selectionCanvas.width = canvas.offsetWidth;
    selectionCanvas.height = canvas.offsetHeight;
    
    const ctx = getCanvasContext(canvas);
    if (!ctx) return;
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onDrawEnd();

    window.addEventListener('resize', resizeCanvases);
    return () => {
        window.removeEventListener('resize', resizeCanvases);
    };
  }, [canvasColor, canvasRef, selectionCanvasRef, getCanvasContext, resizeCanvases, onDrawEnd]);

  const getPoint = (e: MouseEvent | Touch | React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawLine = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
  };
  
  const drawCircle = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.beginPath();
    const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };
  
  const drawTriangle = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineTo(start.x * 2 - end.x, end.y);
    ctx.closePath();
    ctx.stroke();
  };
  
  const handleMouseDown = useCallback((e: MouseEvent | Touch | React.MouseEvent<HTMLCanvasElement>) => {
    const point = getPoint(e);

    if (tool === 'pipette') {
      const mainCanvas = canvasRef.current;
      const ctx = getCanvasContext(mainCanvas);
      if (!ctx) return;
      const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
      const hexColor = `#${("000000" + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6)}`;
      onColorPick(hexColor);
      return;
    }

    const canvas = tool === 'ai-eraser' ? selectionCanvasRef.current : canvasRef.current;
    if (!canvas) return;
    const ctx = getCanvasContext(canvas);
    if (!ctx) return;

    setIsDrawing(true);
    startPoint.current = point;
    
    const mainCanvas = canvasRef.current;
    if (tool !== 'brush' && tool !== 'eraser' && tool !== 'ai-eraser' && mainCanvas) {
      snapshot.current = getCanvasContext(mainCanvas)?.getImageData(0, 0, mainCanvas.width, mainCanvas.height) ?? null;
    }

    ctx.beginPath();
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = tool === 'ai-eraser' ? '#FFFFFF' : strokeColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = canvasColor;
    }
    
    if(tool === 'ai-eraser') {
       ctx.globalCompositeOperation = 'source-over';
    } else {
       ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    }


    if (tool === 'brush' || tool === 'eraser' || tool === 'ai-eraser') {
      ctx.moveTo(point.x, point.y);
    }
  }, [tool, strokeWidth, strokeColor, canvasColor, canvasRef, selectionCanvasRef, getCanvasContext, onColorPick]);

  const handleMouseMove = useCallback((e: MouseEvent | Touch | React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const currentPoint = getPoint(e);
    const canvas = tool === 'ai-eraser' ? selectionCanvasRef.current : canvasRef.current;
    const mainCanvas = canvasRef.current;
    if (!canvas || !mainCanvas) return;
    
    const ctx = getCanvasContext(canvas);
    if (!ctx || !startPoint.current) return;

    if (snapshot.current && tool !== 'brush' && tool !== 'eraser' && tool !== 'ai-eraser') {
      getCanvasContext(mainCanvas)?.putImageData(snapshot.current, 0, 0);
    }
    
    const currentToolCtx = (tool === 'brush' || tool === 'eraser' || tool === 'ai-eraser') ? ctx : getCanvasContext(mainCanvas);
    if (!currentToolCtx) return;

    switch (tool) {
      case 'brush':
      case 'eraser':
      case 'ai-eraser':
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
        break;
      case 'line':
        drawLine(currentToolCtx, startPoint.current, currentPoint);
        break;
      case 'rectangle':
        drawRectangle(currentToolCtx, startPoint.current, currentPoint);
        break;
      case 'circle':
        drawCircle(currentToolCtx, startPoint.current, currentPoint);
        break;
      case 'triangle':
        drawTriangle(currentToolCtx, startPoint.current, currentPoint);
        break;
    }
  }, [isDrawing, tool, canvasRef, selectionCanvasRef, getCanvasContext]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (tool === 'ai-eraser') {
      const selectionCanvas = selectionCanvasRef.current;
      const ctx = getCanvasContext(selectionCanvas);
      if (ctx && selectionCanvas) {
         ctx.globalCompositeOperation = 'destination-over';
         ctx.fillStyle = '#000000';
         ctx.fillRect(0, 0, selectionCanvas.width, selectionCanvas.height);
      }
      onAiErase();
    }
    onDrawEnd();
    snapshot.current = null;
  }, [isDrawing, tool, selectionCanvasRef, onAiErase, getCanvasContext, onDrawEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);


  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  };
}
