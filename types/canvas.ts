export type DrawingTool = 'cursor' | 'pencil' | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  points: Point[];
  tool: DrawingTool;
}
