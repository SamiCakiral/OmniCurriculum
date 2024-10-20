import React, { useState, useRef, useEffect } from 'react';
import SideBar from './VSCodeComponents/SideBar';
import Explorer from './VSCodeComponents/Explorer';
import Editor from './VSCodeComponents/Editor';
import Console from './VSCodeComponents/Console';
import StatusBar from './VSCodeComponents/StatusBar';
import Chronologie from './VSCodeComponents/Chronologie';
import './vscode-custom-layout.css';

const VSCodeTheme = () => {
  const [activeFiles, setActiveFiles] = useState([]);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  
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
    <div className="vscode-layout">
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
        />
        <div className="vscode-content">
          {showExplorer && (
            <>
              <div ref={explorerChronologieRef} className="vscode-explorer-chronologie">
                <div ref={explorerRef} className="vscode-explorer">
                  <Explorer addActiveFile={addActiveFile} />
                </div>
                <div ref={resizerExplorerChronologieRef} className="resizer-v"></div>
                <div ref={chronologieRef} className="vscode-chronologie">
                  <Chronologie />
                </div>
              </div>
              <div ref={resizerHorizontalRef} className="resizer-h"></div>
            </>
          )}
          <div ref={editorConsoleRef} className="vscode-editor-console">
            <div className="vscode-editor">
              {activeFiles.map((file, index) => (
                <Editor 
                  key={file.name} 
                  file={file} 
                  removeFile={removeActiveFile}
                />
              ))}
            </div>
            {showConsole && (
              <>
                <div ref={resizerVerticalRef} className="resizer-v"></div>
                <div ref={consoleRef} className="vscode-console">
                  <Console />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
};

export default VSCodeTheme;
