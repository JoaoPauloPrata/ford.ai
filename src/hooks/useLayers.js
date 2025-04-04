import { useState, useCallback } from 'react';
import { useEditor } from './useEditor';

export const useLayers = () => {
  const [layers, setLayers] = useState([{
    id: 'base-layer',
    name: 'Camada Base',
    type: 'base',
    visible: true,
    locked: false
  }]);
  const [selectedLayers, setSelectedLayers] = useState(new Set(['base-layer']));
  const [activeLayer, setActiveLayer] = useState('base-layer');
  
  const { saveToHistory } = useEditor();

  const handleLayerSelect = useCallback((layerId, e) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedLayers(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(layerId)) {
          newSelected.delete(layerId);
        } else {
          newSelected.add(layerId);
        }
        return newSelected;
      });
    } else {
      setSelectedLayers(new Set([layerId]));
    }
    setActiveLayer(layerId);
  }, []);

  const handleLayerVisibility = useCallback((layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible } 
        : layer
    ));
    saveToHistory('toggle_layer_visibility');
  }, [layers, saveToHistory]);

  const handleLayerLock = useCallback((layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, locked: !layer.locked } 
        : layer
    ));
    saveToHistory('toggle_layer_lock');
  }, [layers, saveToHistory]);

  const handleLayerName = useCallback((layerId, name) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, name } 
        : layer
    ));
  }, [layers]);

  const addNewLayer = useCallback(() => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `Camada ${layers.length + 1}`,
      type: 'empty',
      visible: true,
      locked: false
    };
    
    setLayers([...layers, newLayer]);
    setSelectedLayers(new Set([newLayer.id]));
    setActiveLayer(newLayer.id);
    
    saveToHistory('add_layer');
  }, [layers, saveToHistory]);

  const mergeLayers = useCallback(() => {
    if (selectedLayers.size <= 1) return;
    
    // Implementação da mesclagem de camadas aqui
    
    saveToHistory('merge_layers');
  }, [selectedLayers, saveToHistory]);

  const handleDeleteLayer = useCallback((layerId) => {
    if (layerId === 'base-layer') return;
    
    setLayers(layers.filter(layer => layer.id !== layerId));
    
    setSelectedLayers(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(layerId)) {
        newSelected.delete(layerId);
        if (newSelected.size === 0) {
          newSelected.add('base-layer');
        }
      }
      return newSelected;
    });
    
    if (activeLayer === layerId) {
      setActiveLayer('base-layer');
    }
    
    saveToHistory('delete_layer');
  }, [layers, activeLayer, saveToHistory]);

  return {
    layers,
    setLayers,
    selectedLayers,
    activeLayer,
    handleLayerSelect,
    handleLayerVisibility,
    handleLayerLock,
    handleLayerName,
    addNewLayer,
    mergeLayers,
    handleDeleteLayer
  };
}; 