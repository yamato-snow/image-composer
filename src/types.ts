export interface BatchJob {
  id: string;
  templateId: string;
  csvData: string[][];
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt?: Date;
  results?: {
    successful: number;
    failed: number;
    outputUrl?: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  width: number;
  height: number;
  backgroundColor?: string;
  elements: TemplateElement[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'background';
  properties: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
  dataBinding?: {
    field: string;
    format?: string;
  };
} 