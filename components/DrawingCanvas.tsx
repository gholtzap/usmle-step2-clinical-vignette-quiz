'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingTool, Point, DrawingPath } from '@/types/canvas';

interface DrawingCanvasProps {
  tool: DrawingTool;
  onClear?: () => void;
  clearTrigger?: number;
}

export default function DrawingCanvas({ tool, onClear, clearTrigger }: DrawingCanvasProps) {
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
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      if (path.tool === 'pencil') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'source-over';
      } else if (path.tool === 'eraser') {
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'destination-out';
      }

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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (tool === 'cursor') return;

    e.preventDefault();
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setCurrentPath([point]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'cursor') return;

    e.preventDefault();
    const point = getCanvasPoint(e);
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

      if (tool === 'pencil') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'source-over';
      } else if (tool === 'eraser') {
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'destination-out';
      }

      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    if (currentPath.length > 0 && tool !== 'cursor') {
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
