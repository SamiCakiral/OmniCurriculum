import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import SideBar from './components/VSCodeComponents/SideBar';
import Explorer from './components/VSCodeComponents/Explorer';
import Editor from './components/VSCodeComponents/Editor';
import Console from './components/VSCodeComponents/Console';
import StatusBar from './components/VSCodeComponents/StatusBar';
import Chronologie from './components/VSCodeComponents/Chronologie';
import './vscode-custom-layout.css';
import Settings from './components/VSCodeComponents/Settings';

const VSCodeTheme = () => {
  const [activeFiles, setActiveFiles] = useState([]);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const [cvData, setCvData] = useState({
    personalInfo: null,
    education: [],
    workExperience: [],
    skills: [],
    projects: [],
    settings: {
      theme: 'sombre'
    }
  });
  
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
    addActiveFile({ section: 'Système', name: 'settings.json' });
  };

  const handleThemeChange = (newTheme) => {
    setCvData(prevData => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        theme: newTheme
      }
    }));
    // Appliquez ici la logique pour changer les classes CSS ou les variables en fonction du thème
  };

  const themeClass = cvData.settings.theme === 'clair' ? 'vscode-layout-light' : 'vscode-layout';

  useEffect(() => {
    const fetchCvData = async () => {
      try {
        const [personalInfo, education, workExperience, skills, projects] = await Promise.all([
          axios.get('http://localhost:8000/api/personal-info/'),
          axios.get('http://localhost:8000/api/education/'),
          axios.get('http://localhost:8000/api/work-experience/'),
          axios.get('http://localhost:8000/api/skills/'),
          axios.get('http://localhost:8000/api/projects/')
        ]);

        setCvData(prevData => ({
          ...prevData,
          personalInfo: personalInfo.data[0],
          education: education.data,
          workExperience: workExperience.data,
          skills: skills.data,
          projects: projects.data
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des données du CV :', error);
      }
    };

    fetchCvData();
  }, []);

  return (
    <div className={themeClass}>
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
          cvData={cvData}
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
              <Editor 
                activeFiles={activeFiles} 
                removeFile={removeActiveFile} 
                fileContents={{
                  'settings.json': <Settings setTheme={handleThemeChange} currentTheme={cvData.settings.theme} />
                }}
              />
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
