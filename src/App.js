import React from 'react';
import './styles/App.css';

// Importações dos componentes de layout
import Header from './components/layout/Header';


// Importações dos providers
import { EditorProvider } from './store/EditorProvider';

const App = () => {
  return (
    <div className="app">
      <Header />
      
      
    </div>
  );
};

// Componente raiz envolvido com o provider para compartilhar o estado
const AppWithProvider = () => {
  return (
    <EditorProvider>
      <App />
    </EditorProvider>
  );
};

export default AppWithProvider;
