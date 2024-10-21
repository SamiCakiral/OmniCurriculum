import React, { useState, useRef, useEffect } from 'react';
import SideBar from './VSCodeComponents/SideBar';
import Explorer from './VSCodeComponents/Explorer';
import Editor from './VSCodeComponents/Editor';
import Console from './VSCodeComponents/Console';
import StatusBar from './VSCodeComponents/StatusBar';
import Chronologie from './VSCodeComponents/Chronologie';
import Settings from './VSCodeComponents/Settings';
import CVPanel from './CVPanel';
import './vscode-custom-layout.css';

const VSCodeTheme = ({ language, setLanguage }) => {
  const [activeFiles, setActiveFiles] = useState([]);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [showCVPanel, setShowCVPanel] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(300);
  const minConsoleHeight = 0;
  const maxConsoleHeight = 500;
  const [explorerHeight, setExplorerHeight] = useState(300);
  const explorerChronologieRef = useRef(null);

  const editorConsoleRef = useRef(null);
  const resizerRef = useRef(null);

  const addActiveFile = (file) => {
    if (!activeFiles.some(f => f.name === file.name)) {
      setActiveFiles([...activeFiles, file]);
    }
  };

  const removeActiveFile = (fileName) => {
    setActiveFiles(activeFiles.filter(f => f.name !== fileName));
  };

  const openSettings = () => {
    setShowSettings(true);
    addActiveFile({ section: 'Paramètres', name: 'settings.json' });
  };

  const openCVPanel = () => {
    setShowCVPanel(true);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeight;

    const handleMouseMove = (e) => {
      const deltaY = startY - e.clientY;
      const newHeight = Math.max(minConsoleHeight, Math.min(startHeight + deltaY, maxConsoleHeight));
      setConsoleHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const [explorerWidth, setExplorerWidth] = useState(250);

  const handleExplorerResize = (e) => {
    const newWidth = e.clientX;
    setExplorerWidth(Math.max(200, Math.min(newWidth, 400))); // Limites min et max
  };

  const handleExplorerChronologieResize = (e) => {
    if (explorerChronologieRef.current) {
      const container = explorerChronologieRef.current;
      const containerRect = container.getBoundingClientRect();
      const newHeight = e.clientY - containerRect.top;
      const totalHeight = containerRect.height;
      
      // Assurez-vous que l'explorateur et la chronologie ont au moins 100px de hauteur
      const minHeight = 100;
      const maxHeight = totalHeight - minHeight;
      
      setExplorerHeight(Math.max(minHeight, Math.min(newHeight, maxHeight)));
    }
  };

  return (
    <div className={`vscode-layout ${theme}`}>
      <div className="vscode-topbar">
        <div className="vscode-window-controls">
          <div className="vscode-window-control close"></div>
          <div className="vscode-window-control minimize"></div>
          <div className="vscode-window-control maximize"></div>
        </div>
        <div className="vscode-title">The Ultimate Curriculum - Sami Cakiral</div>
      </div>
      <div className="vscode-main">
        <SideBar 
          setShowExplorer={setShowExplorer}
          setShowConsole={setShowConsole}
          openSettings={openSettings}
          openCVPanel={openCVPanel}
        />
        <div className="vscode-content">
          {showExplorer && (
            <>
              <div 
                ref={explorerChronologieRef}
                className="vscode-explorer-chronologie" 
                style={{ width: `${explorerWidth}px` }}
              >
                <div style={{ height: `${explorerHeight}px`, overflow: 'auto' }}>
                  <Explorer addActiveFile={addActiveFile} language={language} />
                </div>
                <div 
                  className="resizer-v"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const handleMouseMove = (moveEvent) => handleExplorerChronologieResize(moveEvent);
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                ></div>
                <div style={{ height: `calc(100% - ${explorerHeight}px - 5px)`, overflow: 'auto' }}>
                  <Chronologie language={language} addActiveFile={addActiveFile} />
                </div>
              </div>
              <div 
                className="resizer-h"
                onMouseDown={(e) => {
                  e.preventDefault();
                  document.addEventListener('mousemove', handleExplorerResize);
                  document.addEventListener('mouseup', () => {
                    document.removeEventListener('mousemove', handleExplorerResize);
                  });
                }}
              ></div>
            </>
          )}
          <div ref={editorConsoleRef} className="vscode-editor-console" style={{ width: `calc(100% - ${showExplorer ? explorerWidth + 5 : 0}px)` }}>
            <div className="vscode-editor-console" style={{ height: `calc(100% - ${showConsole ? consoleHeight : 0}px)` }}>
              <div className="vscode-editor" style={{ height: `calc(100% - ${showConsole ? consoleHeight : 0}px)` }}>
                <Editor 
                  activeFiles={activeFiles} 
                  removeFile={removeActiveFile}
                  showSettings={showSettings}
                  settingsContent={
                    <Settings 
                      currentTheme={theme} 
                      setTheme={setTheme}
                      currentLanguage={language}
                      setLanguage={setLanguage}
                    />
                  }
                  language={language}
                />
              </div>
              {showConsole && (
                <>
                  <div 
                    ref={resizerRef}
                    className="resizer-v"
                    onMouseDown={handleResizeStart}
                  />
                  <div className="vscode-console" style={{ height: `${consoleHeight}px` }}>
                    <Console language={language} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <StatusBar />
      <CVPanel isOpen={showCVPanel} onClose={() => setShowCVPanel(false)} language={language} />
    </div>
  );
};

export default VSCodeTheme;
