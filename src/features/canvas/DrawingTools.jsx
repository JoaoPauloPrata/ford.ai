import React, { useContext } from 'react';
import { EditorContext } from '../../store/EditorProvider';

const DrawingTools = () => {
  const { 
    drawingTool, 
    brushColor, 
    brushSize, 
    updateBrush, 
    backgroundColor,
    clearCanvas 
  } = useContext(EditorContext);

  return (
    <div className="brush-section">
      <div className="drawing-tools">
        <button 
          className={`drawing-tool-btn ${drawingTool === 'brush' ? 'active' : ''}`}
          onClick={() => updateBrush(brushColor, brushSize, 'brush')}
          title="Pincel"
        >
          <i className="fas fa-paint-brush"></i>
        </button>
        <button 
          className={`drawing-tool-btn ${drawingTool === 'eraser' ? 'active' : ''}`}
          onClick={() => updateBrush(backgroundColor, brushSize, 'eraser')}
          title="Borracha"
        >
          <i className="fas fa-eraser"></i>
        </button>
        <button 
          className={`drawing-tool-btn ${drawingTool === 'spray' ? 'active' : ''}`}
          onClick={() => updateBrush(brushColor, brushSize, 'spray')}
          title="Spray"
        >
          <i className="fas fa-spray-can"></i>
        </button>
      </div>

      <div className="brush-controls">
        <div className="brush-color">
          <label>Cor:</label>
          <input 
            type="color" 
            value={brushColor}
            onChange={(e) => updateBrush(e.target.value, brushSize)}
          />
        </div>
        <div className="brush-size">
          <label>Tamanho: {brushSize}px</label>
          <input 
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => updateBrush(brushColor, parseInt(e.target.value))}
          />
        </div>
      </div>

      <button className="clear-canvas-btn" onClick={clearCanvas}>
        Limpar Canvas
      </button>
    </div>
  );
};

export default DrawingTools; 