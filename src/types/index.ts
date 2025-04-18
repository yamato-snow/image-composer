export interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily?: string;
  color: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: 'left' | 'center' | 'right';
  rotation?: number;
  zIndex?: number;
}

export interface ImageElement {
  id: string;
  path: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  zIndex?: number;
}

export type Element = TextElement | ImageElement;

export interface BatchJob {
  id: string;
  templateId: string;
  csvData: string[][];
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: {
    success: number;
    failed: number;
    errors?: string[];
  };
  createdAt: Date;
  updatedAt?: Date;
} 