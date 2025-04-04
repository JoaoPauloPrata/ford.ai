import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentResizeHandle, setCurrentResizeHandle] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState({ left: 0, top: 0 });
  const [properties, setProperties] = useState({
    width: 300,
    height: 300,
    left: 250,
    top: 150
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [drawingMode, setDrawingMode] = useState(false);
  const [activeTool, setActiveTool] = useState('move');
  const [backgroundColor, setBackgroundColor] = useState('#555555');
  const [canvasHistory, setCanvasHistory] = useState(null);
  const [layers, setLayers] = useState([{
    id: 'base-layer',
    name: 'Camada Base',
    type: 'base',
    visible: true,
    locked: false
  }]);
  const [selectedLayers, setSelectedLayers] = useState(new Set(['base-layer']));
  const [activeLayer, setActiveLayer] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [drawingTool, setDrawingTool] = useState('brush');
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [saveFormat, setSaveFormat] = useState('png');

  const imageContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // Função para adicionar uma nova imagem
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          src: e.target.result,
          width: 300,
          height: 300,
          left: 250,
          top: 150
        };
        setImages([...images, newImage]);
        setSelectedImage(newImage.id);
        
        // Salvar no histórico
        saveToHistory('add_image');
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para iniciar o arrasto
  const handleMouseDown = (e, imageId) => {
    if (activeTool !== 'move') return; // Só permite mover se a ferramenta de mover estiver ativa
    
    if (!e.target.classList.contains('resize-handle')) {
      setSelectedImage(imageId);
      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      
      const image = images.find(img => img.id === imageId);
      setInitialPos({ 
        left: image.left, 
        top: image.top 
      });
      e.preventDefault();
    }
  };

  // Função para iniciar o redimensionamento
  const handleResizeStart = (e, imageId, handle) => {
    if (activeTool !== 'move') return; // Só permite redimensionar se a ferramenta de mover estiver ativa
    
    setSelectedImage(imageId);
    setIsResizing(true);
    setCurrentResizeHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    const image = images.find(img => img.id === imageId);
    setInitialSize({ 
      width: image.width, 
      height: image.height 
    });
    setInitialPos({ 
      left: image.left, 
      top: image.top 
    });
    
    e.stopPropagation();
  };

  // Função para lidar com movimento do mouse
  const handleMouseMove = (e) => {
    if (isDragging) {
      if (selectedImage) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        
        setImages(images.map(image => 
          image.id === selectedImage 
            ? { 
                ...image,
                left: initialPos.left + deltaX,
                top: initialPos.top + deltaY
              } 
            : image
        ));
        
        setProperties({
          width: images.find(img => img.id === selectedImage)?.width || 0,
          height: images.find(img => img.id === selectedImage)?.height || 0,
          left: initialPos.left + deltaX,
          top: initialPos.top + deltaY
        });
      }
    } else if (isResizing && selectedImage && currentResizeHandle) {
      e.preventDefault();
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      
      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      let newLeft = initialPos.left;
      let newTop = initialPos.top;
      
      // Lógica de redimensionamento baseada no handle
      switch(currentResizeHandle) {
        case 'br':
          newWidth = Math.max(50, initialSize.width + deltaX);
          newHeight = Math.max(50, initialSize.height + deltaY);
          break;
        case 'bl':
          newWidth = Math.max(50, initialSize.width - deltaX);
          newHeight = Math.max(50, initialSize.height + deltaY);
          newLeft = initialPos.left + (initialSize.width - newWidth);
          break;
        case 'tr':
          newWidth = Math.max(50, initialSize.width + deltaX);
          newHeight = Math.max(50, initialSize.height - deltaY);
          newTop = initialPos.top + (initialSize.height - newHeight);
          break;
        case 'tl':
          newWidth = Math.max(50, initialSize.width - deltaX);
          newHeight = Math.max(50, initialSize.height - deltaY);
          newLeft = initialPos.left + (initialSize.width - newWidth);
          newTop = initialPos.top + (initialSize.height - newHeight);
          break;
        default:
          break;
      }
      
      // Atualize o array de imagens em vez de camadas
      setImages(images.map(image => 
        image.id === selectedImage 
          ? { 
              ...image,
              width: newWidth,
              height: newHeight,
              left: newLeft,
              top: newTop
            } 
          : image
      ));
      
      // Atualize as propriedades
      setProperties({
        width: newWidth,
        height: newHeight,
        left: newLeft,
        top: newTop
      });
    }
  };

  // Função para finalizar arrasto/redimensionamento
  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      saveToHistory(isDragging ? 'move_layer' : 'resize_layer');
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setCurrentResizeHandle(null);
  };

  // Função para aplicar alterações dos inputs
  const applyChanges = () => {
    if (selectedImage) {
      setImages(images.map(image => 
        image.id === selectedImage 
          ? { 
              ...image,
              width: Number(properties.width),
              height: Number(properties.height),
              left: Number(properties.left),
              top: Number(properties.top)
            } 
          : image
      ));
    }
  };

  // Função para cancelar alterações
  const cancelChanges = () => {
    if (selectedImage) {
      const currentImage = images.find(img => img.id === selectedImage);
      if (currentImage) {
        setProperties({
          width: currentImage.width,
          height: currentImage.height,
          left: currentImage.left,
          top: currentImage.top
        });
      }
    }
  };

  // Adicionar eventos globais de forma mais eficiente
  useEffect(() => {
    // Só adicionar event listeners se estivermos arrastando ou redimensionando
    if (isDragging || isResizing) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, isResizing, selectedImage, startPos, initialPos, initialSize, currentResizeHandle, images]);

  // Função auxiliar para o input file escondido
  const handleUploadButtonClick = () => {
    document.getElementById('file-input').click();
  };

  // Tratamento de mudanças nos inputs de propriedades
  const handlePropertyChange = (e) => {
    const { name, value } = e.target;
    setProperties(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Adicione esta nova função após as outras funções
  const handleDeleteImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
    if (selectedImage === imageId) {
      setSelectedImage(null);
      setProperties({
        width: 0,
        height: 0,
        left: 0,
        top: 0
      });
    }
    
    // Salvar no histórico
    saveToHistory('delete_image');
  };

  // Adicione esta função após as outras funções
  const initializeCanvas = (canvasElement) => {
    if (!canvasElement) return;
    
    const canvas = canvasElement;
    canvas.width = 800;
    canvas.height = 600;
    
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Restaurar o histórico de desenhos se existir
    if (canvasHistory) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
      img.src = canvasHistory;
    }
  };

  // Adicione estas funções de desenho
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    contextRef.current.strokeStyle = drawingTool === 'eraser' ? backgroundColor : brushColor;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || activeTool !== 'brush') return;
    
    if (drawingTool === 'spray') {
      sprayEffect(e);
    } else {
      const { offsetX, offsetY } = e.nativeEvent;
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    }
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Salvar o estado atual do canvas
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasHistory(canvas.toDataURL());
      saveToHistory('draw');
    }
  };

  // Adicione esta função para atualizar as propriedades do pincel
  const updateBrush = (color, size, tool = null) => {
    setBrushColor(color);
    setBrushSize(size);
    if (tool !== null) {
      setDrawingTool(tool);
    }
    
    if (contextRef.current) {
      contextRef.current.strokeStyle = drawingTool === 'eraser' ? backgroundColor : color;
      contextRef.current.lineWidth = size;
    }
  };

  // Adicione esta nova função
  const handleToolChange = (tool) => {
    setActiveTool(tool);
    setDrawingMode(tool === 'brush');
    
    if (tool === 'brush') {
      if (contextRef.current) {
        contextRef.current.strokeStyle = drawingTool === 'eraser' ? backgroundColor : brushColor;
        contextRef.current.lineWidth = brushSize;
      }
    }
  };

  // Adicione esta nova função para mudar a cor do background
  const handleBackgroundChange = (color) => {
    setBackgroundColor(color);
  };

  // Adicione este useEffect para atualizar o contexto quando as propriedades do pincel mudarem
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);

  // Adicione este useEffect para reinicializar o canvas quando necessário
  useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas(canvasRef.current);
    }
  }, [canvasHistory]); // Dependência do histórico do canvas

  // Adicione esta função
  const clearCanvas = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setCanvasHistory(null);
    }
  };

  // Adicione estas funções para gerenciar camadas
  const handleLayerVisibility = (layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const handleLayerLock = (layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, locked: !layer.locked }
        : layer
    ));
  };

  const handleLayerName = (layerId, newName) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, name: newName }
        : layer
    ));
  };

  const handleLayerSelect = (layerId, event) => {
    if (event.ctrlKey || event.metaKey) {
      // Seleção múltipla com Ctrl/Cmd
      setSelectedLayers(prev => {
        const newSelection = new Set(prev);
        if (layerId !== 'base-layer') { // Não permitir desseleção da camada base
          if (newSelection.has(layerId)) {
            newSelection.delete(layerId);
          } else {
            newSelection.add(layerId);
          }
        }
        return newSelection;
      });
    } else {
      // Seleção única
      setSelectedLayers(new Set([layerId]));
    }
    
    // Atualizar seleção ativa para a última camada selecionada
    setActiveLayer(layerId);
    setSelectedImage(layerId);
    
    const layer = layers.find(l => l.id === layerId);
    if (layer && layer.type === 'image') {
      setProperties({
        width: layer.content.width,
        height: layer.content.height,
        left: layer.content.left,
        top: layer.content.top
      });
    }
  };

  const addNewLayer = () => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `Camada ${layers.length + 1}`,
      type: 'empty',
      visible: true,
      locked: false,
      content: {
        width: 800,
        height: 600,
        left: 0,
        top: 0
      }
    };
    setLayers([...layers, newLayer]);
  };

  const mergeLayers = () => {
    if (selectedLayers.size <= 1) return;

    // Converter Set para Array e ordenar pela ordem das camadas
    const layersToMerge = Array.from(selectedLayers)
      .map(id => layers.find(layer => layer.id === id))
      .filter(layer => layer.id !== 'base-layer');

    // Criar nova camada mesclada
    const mergedLayer = {
      id: `merged-${Date.now()}`,
      name: 'Camada Mesclada',
      type: 'merged',
      visible: true,
      locked: false,
      content: {
        width: 800,
        height: 600,
        left: 0,
        top: 0
      }
    };

    // Remover camadas selecionadas (exceto a base) e adicionar a mesclada
    setLayers(prev => [
      ...prev.filter(layer => 
        !selectedLayers.has(layer.id) || layer.id === 'base-layer'
      ),
      mergedLayer
    ]);

    // Atualizar seleção para a nova camada mesclada
    setSelectedLayers(new Set([mergedLayer.id]));
    setActiveLayer(mergedLayer.id);
    
    // Salvar no histórico
    saveToHistory('merge_layers');
  };

  // Adicione esta nova função para salvar estado no histórico
  const saveToHistory = (actionType) => {
    const currentState = {
      actionType,
      layers: JSON.parse(JSON.stringify(layers)),
      canvasData: canvasRef.current?.toDataURL(),
      activeLayer,
      selectedLayers: new Set(selectedLayers),
      properties: { ...properties }
    };

    // Remover estados futuros se estiver desfazendo ações
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    
    setHistory([...newHistory, currentState]);
    setCurrentHistoryIndex(newHistory.length);
  };

  // Adicione a função para desfazer
  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1];
      
      // Restaurar estado anterior
      setLayers(previousState.layers);
      setActiveLayer(previousState.activeLayer);
      setSelectedLayers(previousState.selectedLayers);
      setProperties(previousState.properties);
      
      // Restaurar canvas se necessário
      if (previousState.canvasData && contextRef.current) {
        const img = new Image();
        img.onload = () => {
          contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          contextRef.current.drawImage(img, 0, 0);
        };
        img.src = previousState.canvasData;
      }
      
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  // Adicione este useEffect para capturar o atalho Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentHistoryIndex, history]);

  // Adicione esta nova função para o spray
  const sprayEffect = (e) => {
    if (!isDrawing || drawingTool !== 'spray') return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = contextRef.current;
    const density = brushSize;
    
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * 360;
      const radius = Math.random() * brushSize;
      const x = offsetX + radius * Math.cos(angle);
      const y = offsetY + radius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.fillStyle = brushColor;
      ctx.arc(x, y, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Adicione este novo componente para a lista de camadas
  const LayersList = () => (
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
        {layers.map((layer, index) => (
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

  // Adicione esta função para gerar a imagem final
  const generateFinalImage = () => {
    return new Promise((resolve) => {
      // Criar um canvas temporário com o mesmo tamanho da área de edição
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 800;
      tempCanvas.height = 600;
      const tempCtx = tempCanvas.getContext('2d');

      // Definir cor de fundo
      tempCtx.fillStyle = backgroundColor;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Desenhar todas as imagens
      images.forEach(image => {
        const img = new Image();
        img.src = image.src;
        tempCtx.drawImage(
          img,
          image.left,
          image.top,
          image.width,
          image.height
        );
      });

      // Desenhar o conteúdo do canvas de desenho
      if (canvasRef.current) {
        tempCtx.drawImage(canvasRef.current, 0, 0);
      }

      // Converter para o formato desejado
      resolve(tempCanvas.toDataURL(`image/${saveFormat}`));
    });
  };

  // Adicione esta função para fazer o download
  const handleDownload = async () => {
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
  };

  return (
    <div className="editor-container">
      {/* Cabeçalho */}
      <header className="header">
        <div className="logo">
          <h1>Creator</h1>
        </div>
        <nav className="nav-menu">
          <ul>
            <li><a href="#register">REGISTER</a></li>
            <li><a href="#fullscreen">FULLSCREEN</a></li>
            <li><a href="#signin">SIGN IN</a></li>
          </ul>
        </nav>
      </header>

      {/* Barra de ferramentas principal */}
      <div className="toolbar">
        <button className="tool-btn" id="new-btn"><i className="fas fa-plus"></i> NEW</button>
        <button 
          className="tool-btn"
          onClick={handleUndo}
          disabled={currentHistoryIndex <= 0}
          title="Desfazer (Ctrl+Z)"
        >
          <i className="fas fa-undo"></i>
        </button>
        <button className="tool-btn active"><i className="fas fa-edit"></i> EDIT</button>
        <button className="tool-btn" onClick={() => setShowSavePopup(true)}>
          <i className="fas fa-save"></i> SAVE
        </button>
        <div className="settings-btn">
          <i className="fas fa-cog"></i>
        </div>
      </div>

      {/* Container principal */}
      <div className="main-content">
        {/* Painel de ferramentas esquerda */}
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
            
            {/* Adicione o botão de mover */}
            <div 
              className={`tool-item ${activeTool === 'move' ? 'active' : ''}`}
              onClick={() => handleToolChange('move')}
            >
              <i className="fas fa-arrows-alt"></i>
              <span>Mover</span>
            </div>
            
            {/* Botão de desenho */}
            <div 
              className={`tool-item ${activeTool === 'brush' ? 'active' : ''}`}
              onClick={() => handleToolChange('brush')}
            >
              <i className="fas fa-paint-brush"></i>
              <span>Desenhar</span>
            </div>

            {/* Seção de ferramentas de desenho */}
            {activeTool === 'brush' && (
              <div className="brush-section">
                <div className="drawing-tools">
                  <button 
                    className={`drawing-tool-btn ${drawingTool === 'brush' ? 'active' : ''}`}
                    onClick={() => updateBrush(brushColor, brushSize, 'brush')}
                    title="Pincel"
                  >
                    <i className="fas fa-paint-brush"></i>
                  </button>
                  <button 
                    className={`drawing-tool-btn ${drawingTool === 'eraser' ? 'active' : ''}`}
                    onClick={() => updateBrush(backgroundColor, brushSize, 'eraser')}
                    title="Borracha"
                  >
                    <i className="fas fa-eraser"></i>
                  </button>
                  <button 
                    className={`drawing-tool-btn ${drawingTool === 'spray' ? 'active' : ''}`}
                    onClick={() => updateBrush(brushColor, brushSize, 'spray')}
                    title="Spray"
                  >
                    <i className="fas fa-spray-can"></i>
                  </button>
                </div>

                <div className="brush-controls">
                  <div className="brush-color">
                    <label>Cor:</label>
                    <input 
                      type="color" 
                      value={brushColor}
                      onChange={(e) => updateBrush(e.target.value, brushSize)}
                    />
                  </div>
                  <div className="brush-size">
                    <label>Tamanho: {brushSize}px</label>
                    <input 
                      type="range"
                      min="1"
                      max="50"
                      value={brushSize}
                      onChange={(e) => updateBrush(brushColor, parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <button className="clear-canvas-btn" onClick={clearCanvas}>
                  Limpar Canvas
                </button>
              </div>
            )}

            {/* Seção de background */}
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

        {/* Área de edição (canvas) */}
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
              {/* Canvas para desenho */}
              <canvas
                ref={(element) => {
                  if (element && !canvasRef.current) {
                    canvasRef.current = element;
                    initializeCanvas(element);
                  }
                }}
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

              {/* Renderização das camadas fixas */}
              {layers.map(layer => (
                layer.visible && layer.type === 'image' && (
                  <div
                    key={layer.id}
                    className={`layer-image ${activeLayer === layer.id ? 'selected' : ''}`}
                  >
                    <img
                      src={layer.content.src}
                      alt={layer.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Painel de propriedades direita */}
        <div className="right-panel">
          {selectedImage ? (
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
          ) : (
            <div className="no-selection-message">
              <i className="fas fa-image"></i>
              <p>Selecione uma imagem para ver suas propriedades</p>
            </div>
          )}
          
          {/* Painel de camadas */}
          <LayersList />
        </div>
      </div>

      {/* Rodapé */}
      <footer className="footer">
        <div className="social-links">
          <a href="#facebook"><i className="fab fa-facebook-f"></i></a>
          <a href="#twitter"><i className="fab fa-twitter"></i></a>
        </div>
        <div className="footer-links">
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
          <a href="#ribbet-lab">Ribbet Lab</a>
          <a href="#blog">The Blog</a>
          <a href="#contact">Contact Us</a>
          <a href="#forum">Forum</a>
        </div>
        <div className="copyright">
          <p>Ribbet © 2023</p>
        </div>
      </footer>

      {showSavePopup && (
        <div className="popup-overlay">
          <div className="save-popup">
            <h2>Salvar Imagem</h2>
            <div className="format-selection">
              <label>Selecione o formato:</label>
              <select 
                value={saveFormat} 
                onChange={(e) => setSaveFormat(e.target.value)}
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WEBP</option>
              </select>
            </div>
            <div className="popup-buttons">
              <button 
                className="download-btn"
                onClick={handleDownload}
              >
                Download
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowSavePopup(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
