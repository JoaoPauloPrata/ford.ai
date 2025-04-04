import React, { useRef, useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useImages } from '../../hooks/useImages';
import { useEditor } from '../../hooks/useEditor';

const Canvas = () => {
  const { 
    canvasRef, 
    contextRef, 
    initializeCanvas, 
    startDrawing, 
    draw, 
    stopDrawing, 
    isDrawing,
    drawingTool,
    backgroundColor
  } = useCanvas();
  
  const {
    images,
    selectedImage,
    handleMouseDown,
    handleResizeStart,
    handleDeleteImage
  } = useImages();
  
  const { activeTool } = useEditor();
  
  const imageContainerRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas(canvasRef.current);
    }
  }, []);

  return (
    <div className="canvas-container">
      <div 
        id="canvas-area"
        style={{ backgroundColor: backgroundColor }}
      >
        <div 
          id="image-container" 
          ref={imageContainerRef}
          className={`${activeTool}-mode`}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className={`drawing-canvas ${activeTool === 'brush' ? 'active' : ''}`}
            style={{
              pointerEvents: activeTool === 'brush' ? 'auto' : 'none',
              cursor: drawingTool === 'eraser' ? 'cell' : 
                     drawingTool === 'spray' ? 'crosshair' : 
                     drawingTool === 'brush' ? 'crosshair' : 'default'
            }}
          />

          {images.map(image => (
            <div
              key={image.id}
              className={`uploaded-image ${selectedImage === image.id ? 'selected' : ''}`}
              style={{
                width: `${image.width}px`,
                height: `${image.height}px`,
                left: `${image.left}px`,
                top: `${image.top}px`,
                position: 'absolute',
                cursor: activeTool === 'move' ? 'move' : 'default',
                pointerEvents: activeTool === 'move' ? 'auto' : 'none'
              }}
              onMouseDown={(e) => handleMouseDown(e, image.id)}
            >
              <img
                src={image.src}
                alt="uploaded"
                style={{
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}
              />
              {selectedImage === image.id && activeTool === 'move' && (
                <>
                  <div 
                    className="resize-handle tl" 
                    onMouseDown={(e) => handleResizeStart(e, image.id, 'tl')}
                  />
                  <div 
                    className="resize-handle tr" 
                    onMouseDown={(e) => handleResizeStart(e, image.id, 'tr')}
                  />
                  <div 
                    className="resize-handle bl" 
                    onMouseDown={(e) => handleResizeStart(e, image.id, 'bl')}
                  />
                  <div 
                    className="resize-handle br" 
                    onMouseDown={(e) => handleResizeStart(e, image.id, 'br')}
                  />
                  <button 
                    className="delete-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas; 