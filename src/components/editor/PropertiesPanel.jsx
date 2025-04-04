import React from 'react';
import ImageProperties from '../../features/images/ImageProperties';
import LayersList from '../../features/layers/LayersList';

const PropertiesPanel = () => {
  return (
    <div className="right-panel">
      <ImageProperties />
      <LayersList />
    </div>
  );
};

export default PropertiesPanel; 