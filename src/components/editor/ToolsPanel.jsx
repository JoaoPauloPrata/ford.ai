import React, { useContext } from 'react';
import { EditorContext } from '../../store/EditorProvider';
import DrawingTools from '../../features/canvas/DrawingTools';

const ToolsPanel = () => {
  // Use o contexto aqui, no nível superior do componente
  const { 
    activeTool, 
    handleToolChange, 
    backgroundColor, 
    handleBackgroundChange,
    handleImageUpload // Obtenha a função de upload do contexto
  } = useContext(EditorContext);

  const handleUploadButtonClick = () => {
    document.getElementById('file-input').click();
  };

  return (
    <div className="left-panel">
      <div className="tools-section">
        <h2>BASIC</h2>
        <div className="tool-item" onClick={handleUploadButtonClick}>
          <i className="fas fa-upload"></i>
          <span>Adicionar Imagem</span>
          <input 
            id="file-input" 
            type="file" 
            accept="image/*" 
            style={{display: 'none'}} 
            onChange={handleImageUpload} 
          />
        </div>
        
        <div 
          className={`tool-item ${activeTool === 'move' ? 'active' : ''}`}
          onClick={() => handleToolChange('move')}
        >
          <i className="fas fa-arrows-alt"></i>
          <span>Mover</span>
        </div>
        
        <div 
          className={`tool-item ${activeTool === 'brush' ? 'active' : ''}`}
          onClick={() => handleToolChange('brush')}
        >
          <i className="fas fa-paint-brush"></i>
          <span>Desenhar</span>
        </div>

        {activeTool === 'brush' && (
          <DrawingTools />
        )}

        <div className="background-section">
          <div className="background-color">
            <label>Cor de Fundo:</label>
            <input 
              type="color" 
              value={backgroundColor}
              onChange={(e) => handleBackgroundChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPanel; 