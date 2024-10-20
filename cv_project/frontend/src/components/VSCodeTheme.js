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
  
  const explorerChronologieRef = useRef(null);
  const explorerRef = useRef(null);
  const chronologieRef = useRef(null);
  const editorConsoleRef = useRef(null);
  const consoleRef = useRef(null);
  const resizerHorizontalRef = useRef(null);
  const resizerVerticalRef = useRef(null);
  const resizerExplorerChronologieRef = useRef(null);

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

  useEffect(() => {
    const resizeHorizontal = (e) => {
      if (explorerChronologieRef.current && editorConsoleRef.current) {
        const newWidth = e.clientX;
        explorerChronologieRef.current.style.width = `${newWidth}px`;
        editorConsoleRef.current.style.width = `calc(100% - ${newWidth}px)`;
      }
    };

    const resizeVertical = (e) => {
      if (editorConsoleRef.current && consoleRef.current) {
        const containerRect = editorConsoleRef.current.getBoundingClientRect();
        const newHeight = containerRect.bottom - e.clientY;
        consoleRef.current.style.height = `${newHeight}px`;
      }
    };

    const resizeExplorerChronologie = (e) => {
      if (explorerRef.current && chronologieRef.current) {
        const containerRect = explorerChronologieRef.current.getBoundingClientRect();
        const newExplorerHeight = e.clientY - containerRect.top;
        explorerRef.current.style.height = `${newExplorerHeight}px`;
        chronologieRef.current.style.height = `calc(100% - ${newExplorerHeight}px)`;
      }
    };

    const stopResize = () => {
      window.removeEventListener('mousemove', resizeHorizontal);
      window.removeEventListener('mousemove', resizeVertical);
      window.removeEventListener('mousemove', resizeExplorerChronologie);
    };

    const initResizeHorizontal = (e) => {
      e.preventDefault();
      window.addEventListener('mousemove', resizeHorizontal);
      window.addEventListener('mouseup', stopResize);
    };

    const initResizeVertical = (e) => {
      e.preventDefault(); // Empêche la sélection de texte pendant le redimensionnement
      window.addEventListener('mousemove', resizeVertical);
      window.addEventListener('mouseup', stopResize);
    };

    const initResizeExplorerChronologie = (e) => {
      e.preventDefault();
      window.addEventListener('mousemove', resizeExplorerChronologie);
      window.addEventListener('mouseup', stopResize);
    };

    if (resizerHorizontalRef.current) {
      resizerHorizontalRef.current.addEventListener('mousedown', initResizeHorizontal);
    }

    if (resizerVerticalRef.current) {
      resizerVerticalRef.current.addEventListener('mousedown', initResizeVertical);
    }

    if (resizerExplorerChronologieRef.current) {
      resizerExplorerChronologieRef.current.addEventListener('mousedown', initResizeExplorerChronologie);
    }

    return () => {
      if (resizerHorizontalRef.current) {
        resizerHorizontalRef.current.removeEventListener('mousedown', initResizeHorizontal);
      }
      if (resizerVerticalRef.current) {
        resizerVerticalRef.current.removeEventListener('mousedown', initResizeVertical);
      }
      if (resizerExplorerChronologieRef.current) {
        resizerExplorerChronologieRef.current.removeEventListener('mousedown', initResizeExplorerChronologie);
      }
      window.removeEventListener('mouseup', stopResize);
    };
  }, []);

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
              <div ref={explorerChronologieRef} className="vscode-explorer-chronologie">
                <div ref={explorerRef} className="vscode-explorer">
                  <Explorer addActiveFile={addActiveFile} language={language} />
                </div>
                <div ref={resizerExplorerChronologieRef} className="resizer-v"></div>
                <div ref={chronologieRef} className="vscode-chronologie">
                <Chronologie language={language} addActiveFile={addActiveFile} />
                </div>
              </div>
              <div ref={resizerHorizontalRef} className="resizer-h"></div>
            </>
          )}
          <div ref={editorConsoleRef} className="vscode-editor-console">
            <div className="vscode-editor">
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
                <div ref={resizerVerticalRef} className="resizer-v"></div>
                <div ref={consoleRef} className="vscode-console">
                  <Console language={language} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <StatusBar />
      <CVPanel isOpen={showCVPanel} onClose={() => setShowCVPanel(false)} language={language} />
    </div>
  );
};

export default VSCodeTheme;
