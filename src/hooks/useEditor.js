import { useState, useCallback, useEffect } from 'react';

export const useEditor = () => {
  const [activeTool, setActiveTool] = useState('brush');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [saveFormat, setSaveFormat] = useState('png');

  const handleToolChange = useCallback((tool) => {
    setActiveTool(tool);
  }, []);

  const handleBackgroundChange = useCallback((color) => {
    setBackgroundColor(color);
    saveToHistory('change_background');
  }, []);

  const saveToHistory = useCallback((actionType) => {
    // Implemente a lógica de salvamento no histórico
    const newHistoryEntry = {
      type: actionType,
      timestamp: Date.now(),
      state: {
        // Capture o estado atual da aplicação
      }
    };
    
    setHistory(prevHistory => {
      // Se estamos em um ponto do histórico anterior ao final,
      // descarte todas as entradas posteriores
      const newHistory = prevHistory.slice(0, currentHistoryIndex + 1);
      return [...newHistory, newHistoryEntry];
    });
    
    setCurrentHistoryIndex(prevIndex => prevIndex + 1);
  }, [currentHistoryIndex]);

  const handleUndo = useCallback(() => {
    if (currentHistoryIndex <= 0) return;
    
    setCurrentHistoryIndex(prevIndex => prevIndex - 1);
    
    // Restaure o estado a partir do histórico
    const previousState = history[currentHistoryIndex - 1];
    // Restaure o estado da aplicação com previousState
  }, [currentHistoryIndex, history]);

  const generateFinalImage = useCallback(() => {
    return new Promise((resolve) => {
      // Criar um canvas temporário
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 800;
      tempCanvas.height = 600;
      const tempCtx = tempCanvas.getContext('2d');

      // Definir cor de fundo
      tempCtx.fillStyle = backgroundColor;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Desenhar todas as imagens
      // Precisamos acessar as imagens através de alguma forma

      // Desenhar o conteúdo do canvas de desenho
      const canvas = document.querySelector('canvas');
      if (canvas) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Converter para o formato desejado
      resolve(tempCanvas.toDataURL(`image/${saveFormat}`));
    });
  }, [backgroundColor, saveFormat]);

  const handleDownload = useCallback(async () => {
    const dataUrl = await generateFinalImage();
    
    // Criar link de download
    const link = document.createElement('a');
    link.download = `minha-arte.${saveFormat}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Fechar o popup
    setShowSavePopup(false);
  }, [generateFinalImage, saveFormat]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  return {
    activeTool,
    backgroundColor,
    history,
    currentHistoryIndex,
    showSavePopup,
    saveFormat,
    handleToolChange,
    handleBackgroundChange,
    saveToHistory,
    handleUndo,
    setShowSavePopup,
    setSaveFormat,
    handleDownload
  };
}; 