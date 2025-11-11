'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Undo2, Eraser, Palette } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  color: string;
  size: number;
  points: Point[];
}

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onStrokeUpdate?: (strokes: Stroke[]) => void;
  className?: string;
}

export default function DrawingCanvas({ 
  width = 400, 
  height = 400, 
  onStrokeUpdate,
  className = ''
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#000000');

  // Initialize canvas context
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas?.getContext('2d');
  }, []);

  // Get mouse/touch position relative to canvas
  const getPointFromEvent = useCallback((event: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return { x: 0, y: 0 };
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback(() => {
    const ctx = getContext();
    if (!ctx || !canvasRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw all completed strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.stroke();
    });

    // Draw current stroke if in progress
    if (currentStroke && currentStroke.points.length > 1) {
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      
      for (let i = 1; i < currentStroke.points.length; i++) {
        ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
      }
      
      ctx.stroke();
    }
  }, [strokes, currentStroke, getContext]);

  // Start drawing
  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    const point = getPointFromEvent(event);
    
    const newStroke: Stroke = {
      color: brushColor,
      size: brushSize,
      points: [point]
    };
    
    setCurrentStroke(newStroke);
    setIsDrawing(true);
  }, [getPointFromEvent, brushColor, brushSize]);

  // Continue drawing
  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    
    event.preventDefault();
    const point = getPointFromEvent(event);
    
    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point]
      };
    });
  }, [isDrawing, currentStroke, getPointFromEvent]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing || !currentStroke) return;
    
    setIsDrawing(false);
    
    if (currentStroke.points.length > 1) {
      setStrokes(prev => {
        const newStrokes = [...prev, currentStroke];
        onStrokeUpdate?.(newStrokes);
        return newStrokes;
      });
    }
    
    setCurrentStroke(null);
  }, [isDrawing, currentStroke, onStrokeUpdate]);

  // Undo last stroke
  const undoLastStroke = useCallback(() => {
    setStrokes(prev => {
      if (prev.length === 0) return prev;
      const newStrokes = prev.slice(0, -1);
      onStrokeUpdate?.(newStrokes);
      return newStrokes;
    });
  }, [onStrokeUpdate]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    onStrokeUpdate?.([]);
  }, [onStrokeUpdate]);

  // Export canvas to PNG
  const exportToPNG = useCallback((): Blob | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    }) as any;
  }, []);

  // Setup event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  // Redraw canvas when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div className={`drawing-canvas-container ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-4 border-gray-300 rounded-lg bg-white shadow-lg cursor-crosshair touch-none"
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
      
      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Size:</span>
          <button
            className={`w-6 h-6 rounded-full border-2 ${
              brushSize === 2 ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white'
            }`}
            onClick={() => setBrushSize(2)}
          >
            <div className="w-1 h-1 rounded-full bg-black mx-auto"></div>
          </button>
          <button
            className={`w-6 h-6 rounded-full border-2 ${
              brushSize === 4 ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white'
            }`}
            onClick={() => setBrushSize(4)}
          >
            <div className="w-2 h-2 rounded-full bg-black mx-auto"></div>
          </button>
          <button
            className={`w-6 h-6 rounded-full border-2 ${
              brushSize === 8 ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white'
            }`}
            onClick={() => setBrushSize(8)}
          >
            <div className="w-3 h-3 rounded-full bg-black mx-auto"></div>
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
          />
        </div>

        {/* Undo Button */}
        <button
          onClick={undoLastStroke}
          disabled={strokes.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {/* Clear Button */}
        <button
          onClick={clearCanvas}
          disabled={strokes.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </div>
  );
}

// Export helper functions for parent components
export { type Stroke };
export const canvasUtils = {
  exportToPNG: (canvasRef: React.RefObject<HTMLCanvasElement>): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvasRef.current?.toBlob(resolve, 'image/png');
    });
  }
};