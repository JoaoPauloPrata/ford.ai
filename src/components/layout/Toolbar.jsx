import React from 'react';
import { useEditor } from '../../hooks/useEditor';

const Toolbar = () => {
  const { handleUndo, currentHistoryIndex, setShowSavePopup } = useEditor();

  return (
    <div className="toolbar">
      <button className="tool-btn" id="new-btn">
        <i className="fas fa-plus"></i> NEW
      </button>
      <button 
        className="tool-btn"
        onClick={handleUndo}
        disabled={currentHistoryIndex <= 0}
        title="Desfazer (Ctrl+Z)"
      >
        <i className="fas fa-undo"></i>
      </button>
      <button className="tool-btn active">
        <i className="fas fa-edit"></i> EDIT
      </button>
      <button className="tool-btn" onClick={() => setShowSavePopup(true)}>
        <i className="fas fa-save"></i> SAVE
      </button>
      <div className="settings-btn">
        <i className="fas fa-cog"></i>
      </div>
    </div>
  );
};

export default Toolbar; 