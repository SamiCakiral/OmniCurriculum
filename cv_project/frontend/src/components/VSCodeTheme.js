import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Mosaic } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import './vscode-mosaic-theme.css';
import SideBar from './VSCodeComponents/SideBar';
import Explorer from './VSCodeComponents/Explorer';
import Editor from './VSCodeComponents/Editor';
import Console from './VSCodeComponents/Console';
import StatusBar from './VSCodeComponents/StatusBar';

const VSCodeTheme = () => {
  const [activeFiles, setActiveFiles] = useState([]);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showConsole, setShowConsole] = useState(true);

  const addActiveFile = (file) => {
    if (!activeFiles.some(f => f.name === file.name)) {
      setActiveFiles([...activeFiles, file]);
    }
  };

  const removeActiveFile = (fileName) => {
    setActiveFiles(activeFiles.filter(f => f.name !== fileName));
  };

  const renderTile = (id, path) => {
    switch (id) {
      case 'explorer':
        return showExplorer ? <Explorer addActiveFile={addActiveFile} /> : null;
      case 'editor':
        return (
          <div className="h-full flex flex-col">
            {activeFiles.map((file, index) => (
              <Editor 
                key={file.name} 
                file={file} 
                removeFile={removeActiveFile}
              />
            ))}
          </div>
        );
      case 'console':
        return showConsole ? <Console /> : null;
      default:
        return null;
    }
  };

  const initialLayout = {
    direction: 'row',
    first: 'explorer',
    second: {
      direction: 'column',
      first: 'editor',
      second: 'console',
      splitPercentage: 70,
    },
    splitPercentage: 20,
  };

  return (
    <div style={{backgroundColor: '#1e1e1e', height: '100vh'}}>
      <DndProvider backend={HTML5Backend}>
        <div className="flex flex-col h-screen text-[#cccccc] bg-[#1e1e1e] overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-2 bg-[#3c3c3c]">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#f14c4c]"></div>
              <div className="w-3 h-3 rounded-full bg-[#f5a623]"></div>
              <div className="w-3 h-3 rounded-full bg-[#23d160]"></div>
            </div>
            <div className="flex-1 text-center">The Ultimate Curriculum - Sami Cakiral</div>
          </div>
          
          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            <SideBar 
              setShowExplorer={setShowExplorer}
              setShowConsole={setShowConsole}
            />
            <div className="flex-1">
              <Mosaic
                renderTile={renderTile}
                initialValue={initialLayout}
                className="mosaic bp3-dark"
                style={{backgroundColor: '#1e1e1e'}}
              />
            </div>
          </div>
          
          {/* Status Bar */}
          <StatusBar />
        </div>
      </DndProvider>
    </div>
  );
};

export default VSCodeTheme;