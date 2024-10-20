import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mosaic, MosaicWindow, MosaicContext } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import './editor-mosaic-theme.css';
import JsonViewer from './JsonViewer';
import ReactMarkdown from 'react-markdown';

const EditorPanel = ({ file, content }) => {
  if (file.name.endsWith('.json')) {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] overflow-hidden flex flex-col">
        <JsonViewer content={content} />
      </div>
    );
  } else if (file.name.endsWith('.md')) {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] overflow-y-auto p-4 text-[var(--text-primary)]">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  } else {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] overflow-hidden flex flex-col">
        <pre className="p-4 text-sm font-mono whitespace-pre-wrap overflow-y-auto flex-1 text-[var(--text-primary)]">
          {content}
        </pre>
      </div>
    );
  }
};

const Editor = ({ activeFiles, removeFile, showSettings, settingsContent }) => {
  const [fileContents, setFileContents] = useState({});

  useEffect(() => {
    const fetchFileContents = async () => {
      const contents = {};
      for (const file of activeFiles) {
        if (!fileContents[file.name]) {
          try {
            let response;
            switch (file.section) {
              case 'Scolarité':
                response = await axios.get(`http://localhost:8000/api/education/?institution=${file.name}`);
                if (response.data.length > 0) {
                  const edu = response.data[0];
                  contents[file.name] = `
# ${edu.institution}
## ${edu.start_date} - ${edu.end_date || 'Present'}
- ${edu.degree}
- ${edu.field_of_study}
                  `;
                }
                break;
              case 'Expériences Professionnelles':
                response = await axios.get(`http://localhost:8000/api/work-experience/?position=${file.name}`);
                if (response.data.length > 0) {
                  const exp = response.data[0];
                  contents[file.name] = `
# ${exp.position} at ${exp.company}
## ${exp.start_date} - ${exp.end_date || 'Present'}
${exp.description}
                  `;
                }
                break;
              case 'Projets':
                response = await axios.get(`http://localhost:8000/api/projects/?title=${file.name}`);
                if (response.data.length > 0) {
                  const proj = response.data[0];
                  contents[file.name] = `
# ${proj.title}
${proj.description}
Technologies: ${proj.technologies.join(', ')}
                  `;
                }
                break;
              case 'Compétences':
                response = await axios.get('http://localhost:8000/api/skills/');
                const skills = response.data;
                contents[file.name] = `
# Compétences
${skills.map(skill => `- ${skill.name}: ${skill.level}/5`).join('\n')}
                  `;
                break;
              case 'Emplois/Stages':
              case 'Personnel':
                contents[file.name] = file.content;
                break;
              default:
                contents[file.name] = "Contenu non disponible";
            }
          } catch (error) {
            console.error('Error fetching file content:', error);
            contents[file.name] = "Erreur lors du chargement du contenu";
          }
        }
      }
      setFileContents(prev => ({ ...prev, ...contents }));
    };

    fetchFileContents();
  }, [activeFiles]);

  const renderTile = (id, path) => {
    const file = activeFiles.find(f => f.name === id);
    if (!file) return null;
    
    if (file.name === 'settings.json' && showSettings) {
      return (
        <MosaicWindow
          path={path}
          title="Paramètres"
          toolbarControls={[<button key="close" onClick={() => removeFile('settings.json')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">×</button>]}
          className="bg-[var(--bg-secondary)]"
        >
          {settingsContent}
        </MosaicWindow>
      );
    }

    return (
      <MosaicWindow
        path={path}
        title={`${file.section}/${file.name}`}
        toolbarControls={[<button key="close" onClick={() => removeFile(file.name)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">×</button>]}
        className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
      >
        <EditorPanel file={file} content={fileContents[file.name] || "Chargement..."} />
      </MosaicWindow>
    );
  };

  const initialValue = activeFiles.reduce((acc, file, index) => {
    if (index === 0) return file.name;
    return {
      direction: 'row',
      first: acc,
      second: file.name,
      splitPercentage: 50,
    };
  }, null);

  return (
    <MosaicContext.Provider>
      <Mosaic
        renderTile={renderTile}
        initialValue={initialValue}
        className="mosaic-editor-theme bg-[var(--bg-primary)]"
      />
    </MosaicContext.Provider>
  );
};

export default Editor;
