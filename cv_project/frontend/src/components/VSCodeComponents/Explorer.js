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
    },
    en: {
      Projects: 'Projects',
      JobsInternships: 'Jobs/Internships',
      Personal: 'Personal',
      Skills: 'Skills',
      Hobbies: 'Hobbies',
    }
  };

  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, workExperience, skills, hobbies, personalInfo] = await Promise.all([
          axios.get(`http://localhost:8000/api/projects/?lang=${language}`),
          axios.get(`http://localhost:8000/api/work-experience/?lang=${language}`),
          axios.get('http://localhost:8000/api/skills/'),
          axios.get('http://localhost:8000/api/hobbies/'),
          axios.get(`http://localhost:8000/api/personal-info/?lang=${language}`)
        ]);

        const projectsData = projects.data.map(proj => ({
          name: `${proj.title || 'Untitled Project'}.md`,
          content: `# ${proj.title || 'Untitled Project'}

## Description
${proj.long_description || 'No description available'}

## Technologies
${Array.isArray(proj.technologies) ? proj.technologies.join(', ') : 'Not specified'}

## Date
${proj.start_date || 'Not specified'} - ${proj.end_date || 'Present'}

## Link
${proj.link || 'N/A'}
`
        }));

        const workExperienceData = workExperience.data.map(exp => ({
          name: `${exp.position || 'Untitled Position'} - ${exp.company || 'Unnamed Company'}.md`,
          content: `# ${exp.position || 'Untitled Position'} at ${exp.company || 'Unnamed Company'}

## Period
${exp.start_date || 'Not specified'} - ${exp.end_date || 'Present'}

## Description
${exp.description || 'No description available'}

## Responsibilities
${Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : 'Not specified'}

## Achievements
${Array.isArray(exp.achievements) ? exp.achievements.join('\n') : 'Not specified'}
`
        }));

        const skillsData = {
          "Hard Skills": skills.data.filter(skill => skill.type === 'hard').map(skill => `${skill.name}`),
          "Soft Skills": skills.data.filter(skill => skill.type === 'soft').map(skill => `${skill.name}`)
        };

        const hobbiesData = hobbies.data.map(hobby => ({
          name: `${hobby.name || 'Unnamed Hobby'}.md`,
          content: `# ${hobby.name || 'Unnamed Hobby'}

## Description
${hobby.description || 'No description available'}

## Frequency
${hobby.frequency || 'Not specified'}

## Why I enjoy it
${hobby.reason || 'Not specified'}
`
        }));

        const personalInfoData = personalInfo.data[0] || {};

        setCvStructure({
          [t('Projects')]: projectsData,
          [t('JobsInternships')]: workExperienceData,
          [t('Personal')]: {
            [t('Hobbies')]: hobbiesData,
            [`${t('Skills')}.json`]: { 
              name: `${t('Skills')}.json`, 
              content: JSON.stringify(skillsData, null, 2) 
            },
            'readAboutMe.md': { 
              name: 'readAboutMe.md', 
              content: `# About Me

## Summary
${personalInfoData.summary || 'No summary available'}

## Education
${personalInfoData.education || 'Not specified'}

## Career Objective
${personalInfoData.career_objective || 'Not specified'}

## Languages
${Array.isArray(personalInfoData.languages) ? personalInfoData.languages.join(', ') : 'Not specified'}

## Contact
Email: ${personalInfoData.email || 'Not specified'}
Phone: ${personalInfoData.phone || 'Not specified'}
Location: ${personalInfoData.location || 'Not specified'}
` 
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
