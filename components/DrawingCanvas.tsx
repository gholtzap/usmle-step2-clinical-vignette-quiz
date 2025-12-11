'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingTool, Point, DrawingPath } from '@/types/canvas';

interface DrawingCanvasProps {
  tool: DrawingTool;
  clearTrigger?: number;
}

export default function DrawingCanvas({ tool, clearTrigger }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPaths([]);
    setCurrentPath([]);
  }, []);

  useEffect(() => {
    if (clearTrigger !== undefined && clearTrigger > 0) {
      clearCanvas();
    }
  }, [clearTrigger, clearCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawPaths();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const redrawPaths = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach((path) => {
      if (path.points.length < 2 || path.tool !== 'pencil') return;

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      ctx.stroke();
    });
  }, [paths]);

  useEffect(() => {
    redrawPaths();
  }, [paths, redrawPaths]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const distanceToLineSegment = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      const distX = point.x - lineStart.x;
      const distY = point.y - lineStart.y;
      return Math.sqrt(distX * distX + distY * distY);
    }

    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;

    const distX = point.x - projX;
    const distY = point.y - projY;
    return Math.sqrt(distX * distX + distY * distY);
  };

  const isPointNearPath = (point: Point, path: DrawingPath, threshold: number = 20): boolean => {
    for (let i = 0; i < path.points.length - 1; i++) {
      const distance = distanceToLineSegment(point, path.points[i], path.points[i + 1]);
      if (distance <= threshold) {
        return true;
      }
    }
    return false;
  };

  const removePathsUnderEraser = (point: Point) => {
    setPaths((prevPaths) => prevPaths.filter((path) => !isPointNearPath(point, path)));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (tool === 'cursor') return;

    e.preventDefault();
    setIsDrawing(true);
    const point = getCanvasPoint(e);

    if (tool === 'eraser') {
      removePathsUnderEraser(point);
    } else {
      setCurrentPath([point]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'cursor') return;

    e.preventDefault();
    const point = getCanvasPoint(e);

    if (tool === 'eraser') {
      removePathsUnderEraser(point);
    } else if (tool === 'pencil') {
      setCurrentPath((prev) => [...prev, point]);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (currentPath.length > 0) {
        const lastPoint = currentPath[currentPath.length - 1];

        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'source-over';
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    if (currentPath.length > 0 && tool === 'pencil') {
      setPaths((prev) => [...prev, { points: currentPath, tool }]);
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  const cursorStyle = tool === 'cursor' ? 'default' : tool === 'pencil' ? 'crosshair' : 'cell';

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40"
      style={{
        pointerEvents: tool === 'cursor' ? 'none' : 'auto',
        cursor: cursorStyle,
        touchAction: 'none',
      }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
}
