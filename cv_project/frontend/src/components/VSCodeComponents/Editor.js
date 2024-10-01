import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Editor = ({ file, removeFile }) => {
  const [fileContent, setFileContent] = useState("Chargement du contenu...");

  useEffect(() => {
    const fetchFileContent = async () => {
      if (!file) return;

      try {
        let response;
        switch (file.section) {
          case 'Scolarité':
            response = await axios.get(`http://localhost:8000/api/education/?institution=${file.name}`);
            if (response.data.length > 0) {
              const edu = response.data[0];
              setFileContent(`
# ${edu.institution}
## ${edu.start_date} - ${edu.end_date || 'Present'}
- ${edu.degree}
- ${edu.field_of_study}
              `);
            }
            break;
          case 'Expériences Professionnelles':
            response = await axios.get(`http://localhost:8000/api/work-experience/?position=${file.name}`);
            if (response.data.length > 0) {
              const exp = response.data[0];
              setFileContent(`
# ${exp.position} at ${exp.company}
## ${exp.start_date} - ${exp.end_date || 'Present'}
${exp.description}
              `);
            }
            break;
          case 'Projets':
            response = await axios.get(`http://localhost:8000/api/projects/?title=${file.name}`);
            if (response.data.length > 0) {
              const proj = response.data[0];
              setFileContent(`
# ${proj.title}
${proj.description}
Technologies: ${proj.technologies.join(', ')}
              `);
            }
            break;
          case 'Compétences':
            response = await axios.get('http://localhost:8000/api/skills/');
            const skills = response.data;
            setFileContent(`
# Compétences
${skills.map(skill => `- ${skill.name}: ${skill.level}/5`).join('\n')}
            `);
            break;
          default:
            setFileContent("Contenu non disponible");
        }
      } catch (error) {
        console.error('Error fetching file content:', error);
        setFileContent("Erreur lors du chargement du contenu");
      }
    };

    fetchFileContent();
  }, [file]);

  return (
    <div className="flex-1 bg-[#1e1e1e] overflow-hidden flex flex-col">
      <div className="bg-[#252526] px-4 py-2 text-sm border-b border-[#333333] flex justify-between items-center">
        <span>{`${file.section}/${file.name}`}</span>
        <button 
          onClick={() => removeFile(file.name)}
          className="text-[#cccccc] hover:text-white"
        >
          ×
        </button>
      </div>
      <pre className="p-4 text-sm font-mono whitespace-pre-wrap overflow-y-auto flex-1 text-[#cccccc]">
        {fileContent}
      </pre>
    </div>
  );
};

export default Editor;