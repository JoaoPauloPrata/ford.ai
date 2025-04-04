import { useState, useEffect, useCallback } from 'react';
import { useEditor } from './useEditor';

export const useImages = () => {
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

  const { activeTool, saveToHistory } = useEditor();

  const handleImageUpload = useCallback((e) => {
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
        setImages(prev => [...prev, newImage]);
        setSelectedImage(newImage.id);
        
        saveToHistory('add_image');
      };
      reader.readAsDataURL(file);
    }
  }, [saveToHistory]);

  const handleMouseDown = useCallback((e, imageId) => {
    if (activeTool !== 'move') return;
    
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
  }, [activeTool, images]);

  const handleResizeStart = useCallback((e, imageId, handle) => {
    if (activeTool !== 'move') return;
    
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
  }, [activeTool, images]);

  const handleMouseMove = useCallback((e) => {
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
      
      setProperties({
        width: newWidth,
        height: newHeight,
        left: newLeft,
        top: newTop
      });
    }
  }, [isDragging, isResizing, selectedImage, images, startPos, initialPos, initialSize, currentResizeHandle]);

  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      saveToHistory(isDragging ? 'move_image' : 'resize_image');
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setCurrentResizeHandle(null);
  }, [isDragging, isResizing, saveToHistory]);

  const handlePropertyChange = useCallback((e) => {
    const { name, value } = e.target;
    setProperties(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  }, []);

  const applyChanges = useCallback(() => {
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
      saveToHistory('update_image_properties');
    }
  }, [selectedImage, images, properties, saveToHistory]);

  const cancelChanges = useCallback(() => {
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
  }, [selectedImage, images]);

  const handleDeleteImage = useCallback((imageId) => {
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
    
    saveToHistory('delete_image');
  }, [images, selectedImage, saveToHistory]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage && e.key === 'Delete') {
        handleDeleteImage(selectedImage);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, handleDeleteImage]);

  return {
    selectedImage,
    setSelectedImage,
    images,
    setImages,
    properties,
    isDragging,
    isResizing,
    handleImageUpload,
    handleMouseDown,
    handleResizeStart,
    handleMouseMove,
    handleMouseUp,
    handlePropertyChange,
    applyChanges,
    cancelChanges,
    handleDeleteImage
  };
}; 