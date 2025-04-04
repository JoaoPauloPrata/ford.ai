import React from 'react';
import { useImages } from '../../hooks/useImages';

const ImageProperties = () => {
  const { 
    selectedImage, 
    properties, 
    handlePropertyChange, 
    applyChanges, 
    cancelChanges 
  } = useImages();

  if (!selectedImage) {
    return (
      <div className="no-selection-message">
        <i className="fas fa-image"></i>
        <p>Selecione uma imagem para ver suas propriedades</p>
      </div>
    );
  }

  return (
    <div className="properties-section">
      <h2>Propriedades da Imagem</h2>
      <div className="property-group">
        <label>Tamanho:</label>
        <div className="size-inputs">
          <input 
            type="number" 
            name="width"
            value={properties.width} 
            onChange={handlePropertyChange}
            placeholder="Largura" 
          />
          <span>x</span>
          <input 
            type="number" 
            name="height"
            value={properties.height} 
            onChange={handlePropertyChange}
            placeholder="Altura" 
          />
        </div>
      </div>
      <div className="property-group">
        <label>Posição:</label>
        <div className="position-inputs">
          <input 
            type="number" 
            name="left"
            value={properties.left} 
            onChange={handlePropertyChange}
            placeholder="X" 
          />
          <input 
            type="number" 
            name="top"
            value={properties.top} 
            onChange={handlePropertyChange}
            placeholder="Y" 
          />
        </div>
      </div>
      <button id="apply-changes" onClick={applyChanges}>APLICAR</button>
      <button id="cancel-changes" onClick={cancelChanges}>CANCELAR</button>
    </div>
  );
};

export default ImageProperties; 