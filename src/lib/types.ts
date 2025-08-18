export type DrawingTool =
  | 'pen'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'eraser'
  | 'ai-eraser'
  | 'download'
  | 'ai-complete'
  | 'pipette';

export interface Point {
  x: number;
  y: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
    isLoading?: boolean;
}

export interface DrawingStep {
  tool: 'pen' | 'line' | 'rectangle' | 'circle';
  color: string;
  strokeWidth: number;
  points: Point[];
  thought?: string;
}
