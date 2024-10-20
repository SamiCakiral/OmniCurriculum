import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mosaic, MosaicWindow, MosaicContext } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import './editor-mosaic-theme.css';

const EditorPanel = ({ file, content }) => (
  <div className="flex-1 bg-[#1e1e1e] overflow-hidden flex flex-col">
    <div className="bg-[#252526] px-4 py-2 text-sm border-b border-[#333333] flex justify-between items-center">
      <span>{`${file.section}/${file.name}`}</span>
    </div>
    <pre className="p-4 text-sm font-mono whitespace-pre-wrap overflow-y-auto flex-1 text-[#cccccc]">
      {content}
    </pre>
  </div>
);

const Editor = ({ activeFiles, removeFile }) => {
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
    return (
      <MosaicWindow
        path={path}
        title={`${file.section}/${file.name}`}
        toolbarControls={[<button key="close" onClick={() => removeFile(file.name)}>×</button>]}
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
        className="mosaic-editor-theme"
      />
    </MosaicContext.Provider>
  );
};

export default Editor;
