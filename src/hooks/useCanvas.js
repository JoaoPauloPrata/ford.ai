import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor } from './useEditor';

export const useCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [drawingTool, setDrawingTool] = useState('brush');
  const [canvasHistory, setCanvasHistory] = useState(null);
  
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
  const { backgroundColor, saveToHistory } = useEditor();

  const initializeCanvas = useCallback((canvasElement) => {
    if (!canvasElement) return;
    
    const canvas = canvasElement;
    canvas.width = 800;
    canvas.height = 600;
    
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    contextRef.current = context;

    if (canvasHistory) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
      img.src = canvasHistory;
    }
  }, [canvasHistory, brushColor, brushSize]);

  const startDrawing = useCallback(({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    contextRef.current.strokeStyle = drawingTool === 'eraser' ? backgroundColor : brushColor;
    setIsDrawing(true);
  }, [drawingTool, backgroundColor, brushColor]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    
    if (drawingTool === 'spray') {
      sprayEffect(e);
    } else {
      const { offsetX, offsetY } = e.nativeEvent;
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    }
  }, [isDrawing, drawingTool]);

  const sprayEffect = useCallback((e) => {
    if (!isDrawing || drawingTool !== 'spray') return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = contextRef.current;
    const density = brushSize;
    
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * 360;
      const radius = Math.random() * brushSize;
      const x = offsetX + radius * Math.cos(angle);
      const y = offsetY + radius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.fillStyle = brushColor;
      ctx.arc(x, y, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [isDrawing, drawingTool, brushColor, brushSize]);

  const stopDrawing = useCallback(() => {
    if (!contextRef.current) return;
    
    contextRef.current.closePath();
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasHistory(canvas.toDataURL());
      saveToHistory('draw');
    }
  }, [saveToHistory]);

  const updateBrush = useCallback((color, size, tool = null) => {
    setBrushColor(color);
    setBrushSize(size);
    if (tool !== null) {
      setDrawingTool(tool);
    }
    
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? backgroundColor : color;
      contextRef.current.lineWidth = size;
    }
  }, [backgroundColor]);

  const clearCanvas = useCallback(() => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setCanvasHistory(null);
      saveToHistory('clear_canvas');
    }
  }, [saveToHistory]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = drawingTool === 'eraser' ? backgroundColor : brushColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushColor, brushSize, backgroundColor, drawingTool]);

  return {
    canvasRef,
    contextRef,
    isDrawing,
    brushColor,
    brushSize,
    drawingTool,
    canvasHistory,
    initializeCanvas,
    startDrawing,
    draw,
    stopDrawing,
    updateBrush,
    clearCanvas,
    sprayEffect
  };
}; 