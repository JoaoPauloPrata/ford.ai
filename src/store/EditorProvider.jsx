import React, { createContext, useContext } from 'react';
import { useEditor } from '../hooks/useEditor';
import { useCanvas } from '../hooks/useCanvas';
import { useImages } from '../hooks/useImages';

// Crie o contexto e exporte-o
export const EditorContext = createContext();

// Hook para uso em outros componentes
export const useEditorContext = () => useContext(EditorContext);

const EditorProvider = ({ children }) => {
  const editor = useEditor();
  const canvas = useCanvas();
  const images = useImages();

  // Combine todos os valores em um único objeto para o contexto
  const value = {
    ...editor,
    ...canvas,
    ...images
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider; 