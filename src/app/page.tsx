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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isDrawingProcessRunning = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const getCanvasData = useCallback(
    (canvas: HTMLCanvasElement | null): string => {
      if (!canvas) return '';
      return canvas.toDataURL('image/png');
    },
    []
  );

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasColor]);

  const handleDownload = useCallback(async () => {
    const dataUri = getCanvasData(canvasRef.current);
    if (!dataUri) return;

    setIsProcessing(true);
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

  const handleAiComplete = useCallback(async () => {
    const dataUri = getCanvasData(canvasRef.current);
    if (!dataUri) return;

    setIsProcessing(true);
    toast({
      title: 'AI Completion in Progress...',
      description: 'Sasha is reimagining your sketch. Please wait.',
    });

    try {
      const input: EnhanceSketchWithAIInput = { sketchDataUri: dataUri };
      const result = await enhanceSketchWithAI(input);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = result.enhancedImageDataUri;
    } catch (error) {
      console.error('Error with AI completion:', error);
      toast({
        variant: 'destructive',
        title: 'AI Completion Failed',
        description: 'Something went wrong. Please try again.',
      });
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
        selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
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
  
  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);
  
  const addImageToCanvas = useCallback((dataUri: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = dataUri;
    if (isMobile) {
      setIsChatOpen(false);
    }
    toast({ title: "Image Added", description: "The AI-generated image has been added to your canvas." });
  }, [isMobile, toast]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const drawStep = useCallback((ctx: CanvasRenderingContext2D, step: DrawingStep) => {
    ctx.beginPath();
    ctx.strokeStyle = step.color;
    ctx.fillStyle = step.color;
    ctx.lineWidth = step.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (step.tool === 'brush' || step.tool === 'line') {
      if (step.points.length > 0) {
        ctx.moveTo(step.points[0].x, step.points[0].y);
        for (let i = 1; i < step.points.length; i++) {
          ctx.lineTo(step.points[i].x, step.points[i].y);
        }
      }
    } else if (step.tool === 'rectangle') {
      if (step.points.length < 2) return;
      const start = step.points[0];
      const end = step.points[1];
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (step.tool === 'circle') {
      if (step.points.length < 2) return;
      const start = step.points[0];
      const end = step.points[1];
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    }
    ctx.stroke();
  }, []);
  
  const handleChatSubmit = useCallback(async (prompt: string, style?: string) => {
    if (!prompt) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: prompt };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsProcessing(true);
    isDrawingProcessRunning.current = true;
    
    let thinkingMessageId: string | null = null;
    try {
      const aiResponse: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Ok, I will draw that for you...', isLoading: true };
      thinkingMessageId = aiResponse.id;
      setChatMessages(prev => [...prev, aiResponse]);

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context not found");

      const input: GenerateDrawingStepsInput = { 
        prompt,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        style: style
      };
      const result = await generateDrawingSteps(input);
      
      const finalResponse: ChatMessage = {
        id: aiResponse.id,
        role: 'assistant',
        content: `I'm starting to draw "${prompt}" in a ${style || 'default'} style. You can stop me at any time.`,
        isLoading: false
      };
      setChatMessages(prev => prev.map(msg => msg.id === finalResponse.id ? finalResponse : msg));
      thinkingMessageId = null; // Don't replace this message on error

      for (const step of result.steps) {
        if (!isDrawingProcessRunning.current) {
          toast({ title: "Drawing stopped by user." });
          break;
        }
        drawStep(ctx, step);
        await sleep(50); // Small delay to visualize drawing
      }

    } catch (error) {
      console.error('Error with AI chat generation:', error);
      const errorContent = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      const errorResponse: ChatMessage = {
          id: thinkingMessageId || (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I was unable to process that drawing request. Please try another prompt.',
          isLoading: false
      };
      if (thinkingMessageId) {
        setChatMessages(prev => prev.map(msg => msg.id === thinkingMessageId ? errorResponse : msg));
      } else {
        setChatMessages(prev => [...prev, errorResponse]);
      }
      toast({ variant: 'destructive', title: 'Drawing Failed', description: errorContent });
    } finally {
      setIsProcessing(false);
      isDrawingProcessRunning.current = false;
      if (thinkingMessageId === null) { // Only add finished message if drawing started
        const finalMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Finished drawing!',
            isLoading: false
        };
        setChatMessages(prev => [...prev, finalMessage]);
      }
    }
  }, [drawStep, toast, isMobile]);

  const handleStopDrawing = useCallback(() => {
    isDrawingProcessRunning.current = false;
    setIsProcessing(false);
  }, []);

  const handleColorPick = useCallback((color: string) => {
    setStrokeColor(color);
    setTool('brush');
    toast({
      title: 'Color Picked!',
      description: `Your stroke color is now ${color.toUpperCase()}. Switched back to Brush tool.`,
    });
  }, [toast]);


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
        onAiComplete={handleAiComplete}
        onImageUpload={handleImageUpload}
        isProcessing={isProcessing}
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
          />
        </div>
        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            isChatOpen ? 'w-full md:w-[380px]' : 'w-0',
            { 'hidden md:block': !isChatOpen },
             isChatOpen && isMobile ? 'absolute inset-0 z-50' : ''
          )}
        >
          <SashaChat
             messages={chatMessages}
             onSubmit={handleChatSubmit}
             onImageSelect={addImageToCanvas}
             isMobile={isMobile}
             onClose={() => setIsChatOpen(false)}
             isProcessing={isProcessing}
             onStop={handleStopDrawing}
          />
        </div>
      </main>
      <Button
        variant="primary"
        size="icon"
        className="fixed bottom-4 right-4 z-20 rounded-full h-14 w-14 shadow-lg md:hidden"
        onClick={() => setIsChatOpen(true)}
        aria-label="Open AI Chat"
        style={{backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))'}}
      >
        <Bot className="h-6 w-6" />
      </Button>
      {isProcessing && isDrawingProcessRunning.current && (
        <Button
            variant="destructive"
            size="lg"
            className="fixed bottom-24 right-4 z-20 rounded-full h-14 shadow-lg gap-2"
            onClick={handleStopDrawing}
            aria-label="Stop AI Drawing"
        >
            <Square className="h-5 w-5" />
            Stop
        </Button>
      )}
    </div>
  );
}
