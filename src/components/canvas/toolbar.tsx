'use client';

import {
  Brush,
  Minus,
  RectangleHorizontal,
  Circle,
  Triangle,
  Eraser,
  Sparkles,
  Pipette,
  Upload,
  Download,
  Trash2,
  Loader,
  Square,
  Wand2,
} from 'lucide-react';
import type { DrawingTool } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  tool: DrawingTool;
  setTool: (tool: DrawingTool) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  canvasColor: string;
  setCanvasColor: (color: string) => void;
  onClear: () => void;
  onDownload: () => void;
  onImageUpload: (file: File) => void;
  onAutocomplete: () => void;
  isProcessing: boolean;
  isDrawing: boolean;
  onStopDrawing: () => void;
}

const mainTools: { name: DrawingTool; icon: React.ElementType; label: string }[] = [
  { name: 'brush', icon: Brush, label: 'Brush' },
  { name: 'eraser', icon: Eraser, label: 'Eraser' },
  { name: 'pipette', icon: Pipette, label: 'Color Picker' },
  { name: 'ai-eraser', icon: Sparkles, label: 'AI Eraser' },
];

const shapeTools: { name: DrawingTool; icon: React.ElementType; label: string }[] = [
    { name: 'line', icon: Minus, label: 'Line' },
    { name: 'rectangle', icon: RectangleHorizontal, label: 'Rectangle' },
    { name: 'circle', icon: Circle, label: 'Circle' },
    { name: 'triangle', icon: Triangle, label: 'Triangle' },
];


const colorPalettes = {
  Vibrant: ['#FF4848', '#FF822F', '#FFD44F', '#46E47A', '#38BDF8', '#A020F0', '#E253B8'],
  Pastel: ['#FECDD3', '#FDE68A', '#D9F99D', '#A7F3D0', '#BFDBFE', '#DDD6FE', '#FBCFE8'],
  Monochrome: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#EEEEEE', '#FFFFFF'],
};

export default function Toolbar({
  tool,
  setTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  canvasColor,
  setCanvasColor,
  onClear,
  onDownload,
  onImageUpload,
  onAutocomplete,
  isProcessing,
  isDrawing,
  onStopDrawing
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <header className="relative z-10 w-full shrink-0 border-b bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 flex-wrap items-center justify-center md:justify-between gap-2 px-4">
          
          {/* Main Tools */}
          <div className="flex items-center gap-1">
            {mainTools.map((t) => (
              <Tooltip key={t.name}>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === t.name ? 'primary' : 'ghost'}
                    size="icon"
                    onClick={() => setTool(t.name)}
                    style={tool === t.name ? {backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))'} : {}}
                  >
                    <t.icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
             <Popover>
              <PopoverTrigger asChild>
                <Button variant={shapeTools.some(t => t.name === tool) ? 'primary' : 'ghost'} size="icon"
                 style={shapeTools.some(t => t.name === tool) ? {backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))'} : {}}
                >
                    <Square className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1">
                 <div className="flex items-center gap-1">
                    {shapeTools.map((t) => (
                      <Tooltip key={t.name}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={tool === t.name ? 'primary' : 'ghost'}
                            size="icon"
                            onClick={() => setTool(t.name)}
                            style={tool === t.name ? {backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))'} : {}}
                          >
                            <t.icon className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                 </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Separator orientation="vertical" className="h-8 hidden md:block" />

          {/* Stroke & Canvas Controls */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32 md:w-40 justify-between">
                  <span>Stroke</span>
                  <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: strokeColor }} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <div className="relative">
                    <Input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="h-10 w-full p-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width ({strokeWidth}px)</label>
                  <Slider
                    value={[strokeWidth]}
                    onValueChange={(v) => setStrokeWidth(v[0])}
                    min={1}
                    max={50}
                    step={1}
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32 md:w-40 justify-between">
                  <span>Canvas</span>
                  <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: canvasColor }} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Background Color</label>
                  <Input
                    type="color"
                    value={canvasColor}
                    onChange={(e) => setCanvasColor(e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </div>
                {Object.entries(colorPalettes).map(([name, colors]) => (
                  <div key={name} className="space-y-2">
                     <p className="text-sm font-medium">{name} Palette</p>
                    <div className="grid grid-cols-7 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          className="h-7 w-7 rounded-full border transition-transform hover:scale-110"
                          style={{ backgroundColor: color }}
                          onClick={() => setCanvasColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </PopoverContent>
            </Popover>

          </div>
          
          <Separator orientation="vertical" className="h-8 hidden md:block" />
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onAutocomplete} disabled={isProcessing}>{isProcessing && tool==='autocomplete' ? <Loader className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}</Button></TooltipTrigger>
              <TooltipContent><p>Autocomplete Drawing</p></TooltipContent>
            </Tooltip>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <Tooltip>
              <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleUploadClick}><Upload className="h-5 w-5" /></Button></TooltipTrigger>
              <TooltipContent><p>Upload Image</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onDownload} disabled={isProcessing}>{isProcessing && tool==='download' ? <Loader className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}</Button></TooltipTrigger>
              <TooltipContent><p>Enhance & Download</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onClear}><Trash2 className="h-5 w-5" /></Button></TooltipTrigger>
              <TooltipContent><p>Clear Canvas</p></TooltipContent>
            </Tooltip>
             {isDrawing && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="icon" onClick={onStopDrawing}>
                    <Square className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stop Drawing</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
