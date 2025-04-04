import React, { useContext, createContext, useRef } from 'react';
import { useEditor } from '../hooks/useEditor';
import { useCanvas } from '../hooks/useCanvas';
import { useImages } from '../hooks/useImages';
import { useLayers } from '../hooks/useLayers';

// Criar o contexto
export const EditorContext = createContext({});

// Hook para uso em outros componentes
export const useEditorContext = () => useContext(EditorContext);

export const EditorProvider = ({ children }) => {
  // Refs para os elementos DOM importantes
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const imageContainerRef = useRef(null);
  
  // Usar os hooks personalizados
  const editorState = useEditor();
  const imagesState = useImages();
  const canvasState = useCanvas ? useCanvas() : {};
  const layersState = useLayers ? useLayers() : {};
  
  // Combinar todos os estados e refs no contexto
  const contextValue = {
    ...editorState,
    ...imagesState,
    ...canvasState,
    ...layersState,
    canvasRef,
    contextRef,
    imageContainerRef
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider; 

