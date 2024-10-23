import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/solid';

const Explorer = ({ addActiveFile, language }) => {
  const [cvStructure, setCvStructure] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations = {
    fr: {
      Projects: 'Projets',
      JobsInternships: 'Emplois/Stages',
      Personal: 'Personnel',
      Skills: 'Compétences',
      Hobbies: 'Centres d\'intérêt',
      Education: 'Formation',
    },
    en: {
      Projects: 'Projects',
      JobsInternships: 'Jobs/Internships',
      Personal: 'Personal',
      Skills: 'Skills',
      Hobbies: 'Hobbies',
      Education: 'Education',
    }
  };

  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, workExperience, skills, hobbies, personalInfo, education] = await Promise.all([
          axios.get(`http://localhost:8000/api/projects/?lang=${language}`),
          axios.get(`http://localhost:8000/api/work-experience/?lang=${language}`),
          axios.get('http://localhost:8000/api/skills/'),
          axios.get(`http://localhost:8000/api/hobbies/?lang=${language}`),
          axios.get(`http://localhost:8000/api/personal-info/?lang=${language}`),
          axios.get(`http://localhost:8000/api/education/?lang=${language}`)
        ]);

        const projectsData = projects.data.map(proj => ({
          name: `${proj.title || 'Untitled Project'}.md`,
          content: `# ${proj.title || 'Untitled Project'}

## Description courte
${proj.short_description || 'No short description available'}

## Description longue
${proj.long_description || 'No long description available'}

## Technologies
${proj.technologies ? proj.technologies.join(', ') : 'Not specified'}

## Liens
GitHub: ${proj.github_url || 'N/A'}
Live: ${proj.live_url || 'N/A'}
`
        }));

        const workExperienceData = workExperience.data.map(exp => ({
          name: `${exp.position || 'Untitled Position'} - ${exp.company || 'Unnamed Company'}.md`,
          content: `# ${exp.position || 'Untitled Position'} at ${exp.company || 'Unnamed Company'}

## Période
${exp.start_date || 'Not specified'} - ${exp.end_date || 'Present'}

## Description courte
${exp.short_description || 'No short description available'}

## Description longue
${exp.long_description || 'No long description available'}

## Objectif / But
${exp.objectif_but || 'Not specified'}

## Lieu
${exp.location || 'Not specified'}
`
        }));

        const skillsData = {
          "Hard Skills": skills.data.filter(skill => skill.type === 'hard').map(skill => skill.name),
          "Soft Skills": skills.data.filter(skill => skill.type === 'soft').map(skill => skill.name)
        };

        const hobbiesData = hobbies.data.map(hobby => ({
          name: `${hobby.title || 'Unnamed Hobby'}.md`,
          content: `# ${hobby.title || 'Unnamed Hobby'}

## Description courte
${hobby.short_description || 'No short description available'}

## Description longue
${hobby.long_description || 'No long description available'}
`
        }));

        const personalInfoData = personalInfo.data[0] || {};

        const educationData = education.data.map(edu => ({
          name: `${edu.institution || 'Unnamed Institution'}.md`,
          content: `# ${edu.institution || 'Unnamed Institution'}

## Diplôme
${edu.degree || 'Not specified'}

## Domaine d'étude
${edu.field_of_study || 'Not specified'}

## Description
${edu.description || 'No description available'}

## Période
${edu.start_date || 'Not specified'} - ${edu.end_date || 'Present'}

## Lieu
${edu.location || 'Not specified'}

## Compétences clés acquises
${edu.key_learning ? edu.key_learning.join(', ') : 'Not specified'}
`
        }));

        setCvStructure({
          [t('Projects')]: projectsData,
          [t('JobsInternships')]: workExperienceData,
          [t('Education')]: educationData,
          [t('Personal')]: {
            [t('Hobbies')]: hobbiesData,
            [`${t('Skills')}.json`]: { 
              name: `${t('Skills')}.json`, 
              content: JSON.stringify(skillsData, null, 2) 
            },
            'personalInfo.json': {
              name: 'personalInfo.json',
              content: JSON.stringify(personalInfoData, null, 2)
            }
          }
        });

        setExpandedFolders({ [t('Personal')]: true, [`${t('Personal')}/${t('Hobbies')}`]: true });
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données du CV:', error);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const renderTree = (tree, path = '') => {
    return Object.entries(tree).map(([key, value]) => {
      const currentPath = path ? `${path}/${key}` : key;
      if (Array.isArray(value)) {
        return (
          <div key={currentPath} className="ml-4">
            <div
              className="flex items-center cursor-pointer hover:bg-[var(--hover-bg)] py-1"
              onClick={() => toggleFolder(currentPath)}
            >
              <FolderIcon className="w-4 h-4 mr-2 text-yellow-500" />
              <span>{key}</span>
            </div>
            {expandedFolders[currentPath] && value.map(item => (
              <div
                key={`${currentPath}/${item.name}`}
                className="flex items-center ml-4 cursor-pointer hover:bg-[var(--hover-bg)] py-1"
                onClick={() => addActiveFile({ section: currentPath, name: item.name, content: item.content })}
              >
                <DocumentTextIcon className="w-4 h-4 mr-2 text-blue-400" />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        );
      } else if (typeof value === 'object' && value !== null) {
        if ('name' in value && 'content' in value) {
          return (
            <div
              key={currentPath}
              className="flex items-center ml-4 cursor-pointer hover:bg-[var(--hover-bg)] py-1"
              onClick={() => addActiveFile({ section: path, name: value.name, content: value.content })}
            >
              <DocumentTextIcon className="w-4 h-4 mr-2 text-blue-400" />
              <span>{value.name}</span>
            </div>
          );
        } else {
          return (
            <div key={currentPath} className="ml-4">
              <div
                className="flex items-center cursor-pointer hover:bg-[var(--hover-bg)] py-1"
                onClick={() => toggleFolder(currentPath)}
              >
                <FolderIcon className="w-4 h-4 mr-2 text-yellow-500" />
                <span>{key}</span>
              </div>
              {expandedFolders[currentPath] && renderTree(value, currentPath)}
            </div>
          );
        }
      }
    });
  };

  if (isLoading) return <div className="p-4">Chargement de l'explorateur...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full h-full bg-[var(--bg-secondary)] flex flex-col text-sm text-[var(--text-primary)] overflow-hidden">
      <div className="p-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">Explorer</div>
      <div className="flex-1 overflow-y-auto">
        {renderTree(cvStructure)}
      </div>
    </div>
  );
};

export default Explorer;
