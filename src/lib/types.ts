export type DrawingTool =
  | 'brush'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'eraser'
  | 'ai-eraser'
  | 'download'
  | 'pipette'
  | 'autocomplete';

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
  tool: 'brush' | 'line' | 'rectangle' | 'circle';
  color: string;
  strokeWidth: number;
  points: Point[];
  thought?: string;
}
