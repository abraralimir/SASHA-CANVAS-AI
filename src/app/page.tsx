'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { DrawingTool, ChatMessage, DrawingStep } from '@/lib/types';
import DrawingCanvas from '@/components/canvas/drawing-canvas';
import Toolbar from '@/components/canvas/toolbar';
import SashaChat from '@/components/ai/sasha-chat';
import WelcomeScreen from '@/components/welcome-screen';
import { useToast } from '@/hooks/use-toast';
import {
  enhanceSketchWithAI,
  EnhanceSketchWithAIInput,
} from '@/ai/flows/enhance-sketch-with-ai';
import {
  eraseAndRepairWithAI,
  EraseAndRepairWithAIInput,
} from '@/ai/flows/erase-and-repair-with-ai';
import {
  generateImageFromText,
  GenerateImageFromTextInput,
} from '@/ai/flows/generate-image-from-text';
import {
  generateDrawingSteps,
  GenerateDrawingStepsInput,
} from '@/ai/flows/generate-drawing-steps';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Bot, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [tool, setTool] = useState<DrawingTool>('brush');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [canvasColor, setCanvasColor] = useState('#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const isCanvasEmpty = useRef(true);
  const drawingPlayerId = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsChatOpen(true);
    } else {
      setIsChatOpen(false);
    }
  }, [isMobile]);

  const updateCanvasEmptyState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    const allWhite = !pixelBuffer.some(
      (color) => (color & 0x00ffffff) !== 0x00ffffff
    );
    isCanvasEmpty.current = allWhite;
  }, []);

  const getCanvasData = useCallback(
    (canvas: HTMLCanvasElement | null): string => {
      if (!canvas) return '';
      updateCanvasEmptyState();
      return canvas.toDataURL('image/png');
    },
    [updateCanvasEmptyState]
  );

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    isCanvasEmpty.current = true;
  }, [canvasColor]);

  const addImageToCanvas = useCallback((dataUri: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      handleClear();
      const aspectRatio = img.width / img.height;
      let newWidth = canvas.width;
      let newHeight = newWidth / aspectRatio;
      if (newHeight > canvas.height) {
        newHeight = canvas.height;
        newWidth = newHeight * aspectRatio;
      }
      const x = (canvas.width - newWidth) / 2;
      const y = (canvas.height - newHeight) / 2;
      ctx.drawImage(img, x, y, newWidth, newHeight);
      isCanvasEmpty.current = false;
    };
    img.src = dataUri;
    if (isMobile) {
      setIsChatOpen(false);
    }
  }, [isMobile, handleClear]);

  const handleDownload = useCallback(async () => {
    const dataUri = getCanvasData(canvasRef.current);
    if (!dataUri) return;

    setIsProcessing(true);
    setTool('download');
    toast({
      title: 'Enhancing Image...',
      description: 'Our AI is adding the final touches before download.',
    });

    try {
      const result = await enhanceSketchWithAI({
        sketchDataUri: dataUri,
        prompt: 'enhance this drawing with more details and vibrant colors',
      });
      const link = document.createElement('a');
      link.href = result.enhancedImageDataUri;
      link.download = 'sasha-canvas-ai-drawing.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error enhancing image:', error);
      toast({
        variant: 'destructive',
        title: 'Enhancement Failed',
        description:
          'Could not enhance the image. The original will be downloaded.',
      });
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = 'sasha-canvas-ai-drawing.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsProcessing(false);
    }
  }, [getCanvasData, toast]);

  const handleAiErase = useCallback(async () => {
    const drawingDataUri = getCanvasData(canvasRef.current);
    const selectionDataUri = getCanvasData(selectionCanvasRef.current);

    if (!drawingDataUri || !selectionDataUri) return;

    setIsProcessing(true);
    toast({
      title: 'AI Eraser Activated...',
      description: 'Magically removing the selected area. Please wait.',
    });

    try {
      const input: EraseAndRepairWithAIInput = {
        drawingDataUri,
        selectionDataUri,
      };
      const result = await eraseAndRepairWithAI(input);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const selectionCanvas = selectionCanvasRef.current;
        if (!canvas || !selectionCanvas) return;

        const ctx = canvas.getContext('2d');
        const selectionCtx = selectionCanvas.getContext('2d');
        if (!ctx || !selectionCtx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        selectionCtx.clearRect(
          0,
          0,
          selectionCanvas.width,
          selectionCanvas.height
        );
        isCanvasEmpty.current = false;
      };
      img.src = result.repairedDrawingDataUri;
    } catch (error) {
      console.error('Error with AI eraser:', error);
      toast({
        variant: 'destructive',
        title: 'AI Eraser Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsProcessing(false);
      setTool('brush');
    }
  }, [getCanvasData, toast]);

  const handleImageUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addImageToCanvas(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    },
    [addImageToCanvas]
  );
  
  const stopDrawing = useCallback(() => {
    if (drawingPlayerId.current) {
      clearInterval(drawingPlayerId.current);
      drawingPlayerId.current = null;
    }
    setIsDrawing(false);
  }, []);

  const playDrawingSteps = useCallback(
    (steps: DrawingStep[]) => {
      stopDrawing();
      setIsDrawing(true);
      handleClear();

      let stepIndex = 0;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      drawingPlayerId.current = setInterval(() => {
        if (stepIndex >= steps.length) {
          stopDrawing();
          updateCanvasEmptyState();
          return;
        }

        const step = steps[stepIndex];
        ctx.strokeStyle = step.color;
        ctx.lineWidth = step.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'source-over';

        switch (step.tool) {
          case 'brush':
            if (step.points.length < 2) break;
            ctx.beginPath();
            ctx.moveTo(step.points[0].x, step.points[0].y);
            for (let i = 1; i < step.points.length; i++) {
              ctx.lineTo(step.points[i].x, step.points[i].y);
            }
            ctx.stroke();
            break;
          case 'line':
            if (step.points.length < 2) break;
            ctx.beginPath();
            ctx.moveTo(step.points[0].x, step.points[0].y);
            ctx.lineTo(step.points[1].x, step.points[1].y);
            ctx.stroke();
            break;
          case 'rectangle':
            if (step.points.length < 2) break;
            ctx.strokeRect(
              step.points[0].x,
              step.points[0].y,
              step.points[1].x - step.points[0].x,
              step.points[1].y - step.points[0].y
            );
            break;
          case 'circle':
             if (step.points.length < 2) break;
            ctx.beginPath();
            const radius = Math.sqrt(
              Math.pow(step.points[1].x - step.points[0].x, 2) +
                Math.pow(step.points[1].y - step.points[0].y, 2)
            );
            ctx.arc(step.points[0].x, step.points[0].y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
        }
        stepIndex++;
      }, 50);
    },
    [handleClear, stopDrawing, updateCanvasEmptyState]
  );
  
  const handleChatSubmit = useCallback(
    async (prompt: string, style?: string) => {
      if (!prompt) return;

      stopDrawing();
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
      };
      setChatMessages((prev) => [...prev, newUserMessage]);
      setIsProcessing(true);

      const thinkingMessageId = (Date.now() + 1).toString();
      try {
        const aiThinkingMessage: ChatMessage = {
          id: thinkingMessageId,
          role: 'assistant',
          content: 'Thinking...',
          isLoading: true,
        };
        setChatMessages((prev) => [...prev, aiThinkingMessage]);

        let result;
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas not found');

        if (isCanvasEmpty.current) {
          const input: GenerateDrawingStepsInput = {
            prompt: prompt,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            style: style,
          };
          result = await generateDrawingSteps(input);
          
          const finalResponse: ChatMessage = {
            id: thinkingMessageId,
            role: 'assistant',
            content: `I've started drawing: "${prompt}". You can ask me to edit it once I'm done.`,
            isLoading: false,
          };
          setChatMessages((prev) =>
            prev.map((msg) => (msg.id === thinkingMessageId ? finalResponse : msg))
          );
          playDrawingSteps(result.steps);

        } else {
          // If there is content on the canvas, treat the prompt as an edit request.
          const canvasDataUri = getCanvasData(canvasRef.current);
          if (!canvasDataUri) throw new Error('Could not get canvas data.');

          const input: EnhanceSketchWithAIInput = {
            sketchDataUri: canvasDataUri,
            prompt: style ? `${prompt} in the style of ${style}` : prompt,
          };
          result = await enhanceSketchWithAI(input);
          addImageToCanvas(result.enhancedImageDataUri);

          const finalResponse: ChatMessage = {
            id: thinkingMessageId,
            role: 'assistant',
            content: `I've updated the image based on your request: "${prompt}".`,
            imageUrl: result.enhancedImageDataUri,
            isLoading: false,
          };
          setChatMessages((prev) =>
            prev.map((msg) => (msg.id === thinkingMessageId ? finalResponse : msg))
          );
        }
      } catch (error) {
        console.error('Error with AI chat submission:', error);
        const errorContent =
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.';
        const errorResponse: ChatMessage = {
          id: thinkingMessageId,
          role: 'assistant',
          content:
            'Sorry, I was unable to process that request. Please try again.',
          isLoading: false,
        };
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === thinkingMessageId ? errorResponse : msg))
        );
        toast({
          variant: 'destructive',
          title: 'AI Request Failed',
          description: errorContent,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [getCanvasData, addImageToCanvas, toast, playDrawingSteps, stopDrawing]
  );

  const handleEnhanceImage = useCallback(
    async (imageUrl: string, prompt: string) => {
      setIsProcessing(true);
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
      };
      setChatMessages((prev) => [...prev, newUserMessage]);

      const thinkingMessageId = (Date.now() + 1).toString();
      const aiThinkingMessage: ChatMessage = {
        id: thinkingMessageId,
        role: 'assistant',
        content: 'Enhancing...',
        isLoading: true,
      };
      setChatMessages((prev) => [...prev, aiThinkingMessage]);

      try {
        const input: EnhanceSketchWithAIInput = {
          sketchDataUri: imageUrl,
          prompt: prompt,
        };
        const result = await enhanceSketchWithAI(input);
        addImageToCanvas(result.enhancedImageDataUri);

        const finalResponse: ChatMessage = {
          id: thinkingMessageId,
          role: 'assistant',
          content: `I've enhanced the image based on your request.`,
          imageUrl: result.enhancedImageDataUri,
          isLoading: false,
        };
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === thinkingMessageId ? finalResponse : msg))
        );
      } catch (error) {
        console.error('Error enhancing image:', error);
        const errorContent =
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.';
        const errorResponse: ChatMessage = {
          id: thinkingMessageId,
          role: 'assistant',
          content: 'Sorry, I was unable to enhance the image.',
          isLoading: false,
        };
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === thinkingMessageId ? errorResponse : msg))
        );
        toast({
          variant: 'destructive',
          title: 'Enhancement Failed',
          description: errorContent,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [addImageToCanvas, toast]
  );

  const handleColorPick = useCallback(
    (color: string) => {
      setStrokeColor(color);
      setTool('brush');
      toast({
        title: 'Color Picked!',
        description: `Your stroke color is now ${color.toUpperCase()}. Switched back to Brush tool.`,
      });
    },
    [toast]
  );

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background font-body">
      <Toolbar
        tool={tool}
        setTool={setTool}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        canvasColor={canvasColor}
        setCanvasColor={setCanvasColor}
        onClear={handleClear}
        onDownload={handleDownload}
        onImageUpload={handleImageUpload}
        isProcessing={isProcessing}
        isDrawing={isDrawing}
        onStopDrawing={stopDrawing}
      />
      <main className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 relative h-full flex items-center justify-center p-4">
          <DrawingCanvas
            ref={canvasRef}
            selectionCanvasRef={selectionCanvasRef}
            tool={tool}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            canvasColor={canvasColor}
            onAiErase={handleAiErase}
            onColorPick={handleColorPick}
            onDrawEnd={updateCanvasEmptyState}
          />
        </div>
        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            isChatOpen ? 'w-full md:w-[380px]' : 'w-0',
            { 'md:block': !isChatOpen },
             isChatOpen && isMobile ? 'absolute inset-0 z-50 bg-background' : 'hidden'
          )}
        >
          <SashaChat
            messages={chatMessages}
            onSubmit={handleChatSubmit}
            onImageSelect={addImageToCanvas}
            isMobile={isMobile}
            onClose={() => setIsChatOpen(false)}
            isProcessing={isProcessing}
            onEnhance={handleEnhanceImage}
          />
        </div>
      </main>
      {isMobile && !isChatOpen && (
        <Button
          variant="primary"
          size="icon"
          className="fixed bottom-4 right-4 z-20 rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open AI Chat"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
          }}
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
