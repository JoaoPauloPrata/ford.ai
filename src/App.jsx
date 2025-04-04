import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Toolbar from './components/layout/Toolbar';
import ToolsPanel from './components/editor/ToolsPanel';
import PropertiesPanel from './components/editor/PropertiesPanel';
import Canvas from './features/canvas/Canvas';
import SavePopup from './components/common/SavePopup';
import './styles/App.css';

const App = () => {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Toolbar />
        <div className="editor-container">
          <ToolsPanel />
          <Canvas />
          <PropertiesPanel />
        </div>
      </main>
      <Footer />
      <SavePopup />
    </div>
  );
};

export default App; 