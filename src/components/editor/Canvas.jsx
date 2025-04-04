import React, { useContext, useEffect } from 'react';
import { EditorContext } from '../../store/EditorProvider';

const Canvas = () => {
  const {
    backgroundColor,
    activeTool,
    images,
    selectedImage,
    canvasRef,
    imageContainerRef,
    handleMouseDown,
    handleResizeStart,
    handleDeleteImage,
    startDrawing,
    draw,
    stopDrawing,
    drawingTool
  } = useContext(EditorContext);
  
  // Inicialização do canvas
  useEffect(() => {
    if (canvasRef?.current && typeof window !== 'undefined') {
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 600;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Configurar contexto
      }
    }
  }, [canvasRef]);
  
  return (
    <div className="canvas-area">
      <div 
        className="canvas-wrapper"
        style={{ backgroundColor: backgroundColor || '#ffffff' }}
      >
        <div 
          id="image-container" 
          ref={imageContainerRef}
          className={`${activeTool || 'move'}-mode`}
        >
          {/* Canvas para desenho */}
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

          {/* Renderização das imagens */}
          {images && images.map(image => (
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
              onMouseDown={(e) => handleMouseDown && handleMouseDown(e, image.id)}
            >
              <img
                src={image.src}
                alt="uploaded"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />
              {selectedImage === image.id && activeTool === 'move' && (
                <>
                  <div 
                    className="resize-handle tl" 
                    onMouseDown={(e) => handleResizeStart && handleResizeStart(e, image.id, 'tl')}
                  />
                  <div 
                    className="resize-handle tr" 
                    onMouseDown={(e) => handleResizeStart && handleResizeStart(e, image.id, 'tr')}
                  />
                  <div 
                    className="resize-handle bl" 
                    onMouseDown={(e) => handleResizeStart && handleResizeStart(e, image.id, 'bl')}
                  />
                  <div 
                    className="resize-handle br" 
                    onMouseDown={(e) => handleResizeStart && handleResizeStart(e, image.id, 'br')}
                  />
                  <button 
                    className="delete-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage && handleDeleteImage(image.id);
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