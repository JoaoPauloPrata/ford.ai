import React from 'react';
import { useEditor } from '../../hooks/useEditor';

const SavePopup = () => {
  const { 
    showSavePopup, 
    setShowSavePopup, 
    saveFormat, 
    setSaveFormat, 
    handleDownload 
  } = useEditor();

  if (!showSavePopup) return null;

  return (
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
  );
};

export default SavePopup; 