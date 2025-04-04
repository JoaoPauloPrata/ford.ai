import React from 'react';
import { useLayers } from '../../hooks/useLayers';

const LayersList = () => {
  const { 
    layers, 
    selectedLayers, 
    activeLayer,
    handleLayerSelect, 
    handleLayerVisibility,
    handleLayerLock,
    handleLayerName,
    addNewLayer,
    mergeLayers,
    handleDeleteImage
  } = useLayers();

  return (
    <div className="layers-panel">
      <div className="layers-header">
        <h2>Camadas</h2>
        <div className="layers-actions">
          <button 
            className="add-layer-btn"
            onClick={addNewLayer}
            title="Adicionar Nova Camada"
          >
            <i className="fas fa-plus"></i>
          </button>
          <button 
            className={`merge-layers-btn ${selectedLayers.size <= 1 ? 'disabled' : ''}`}
            onClick={mergeLayers}
            disabled={selectedLayers.size <= 1}
            title="Mesclar Camadas Selecionadas"
          >
            <i className="fas fa-object-group"></i>
          </button>
        </div>
      </div>
      <div className="layers-list">
        {layers.map((layer) => (
          <div 
            key={layer.id}
            className={`layer-item ${selectedLayers.has(layer.id) ? 'selected' : ''} ${activeLayer === layer.id ? 'active' : ''}`}
            onClick={(e) => handleLayerSelect(layer.id, e)}
          >
            <div className="layer-controls">
              <button 
                className={`visibility-btn ${layer.visible ? 'visible' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLayerVisibility(layer.id);
                }}
              >
                <i className={`fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </button>
              <button 
                className={`lock-btn ${layer.locked ? 'locked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLayerLock(layer.id);
                }}
              >
                <i className={`fas ${layer.locked ? 'fa-lock' : 'fa-lock-open'}`}></i>
              </button>
            </div>
            <input
              type="text"
              value={layer.name}
              onChange={(e) => handleLayerName(layer.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {layer.id !== 'base-layer' && (
              <button 
                className="delete-layer-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(layer.id);
                }}
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersList; 