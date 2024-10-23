import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/solid';

const Explorer = ({ addActiveFile, language }) => {
  const [cvStructure, setCvStructure] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugContent, setDebugContent] = useState(null);

  const translations = {
    fr: {
      Projects: 'Projets',
      JobsInternships: 'Emplois/Stages',
      Personal: 'Personnel',
      Skills: 'Compétences',
      Hobbies: 'Centres d\'intérêt',
      Education: 'Formation',
      ShortDescription: 'Description courte',
      LongDescription: 'Description longue',
      Links: 'Liens',
      Technologies: 'Technologies',
      Degree: 'Diplôme',
      FieldOfStudy: 'Domaine d\'étude',
      Period: 'Période',
      Location: 'Lieu',
      KeySkillsAcquired: 'Compétences clés acquises',
      ObjectivePurpose: 'Objectif / But',
    },
    en: {
      Projects: 'Projects',
      JobsInternships: 'Jobs/Internships',
      Personal: 'Personal',
      Skills: 'Skills',
      Hobbies: 'Hobbies',
      Education: 'Education',
      ShortDescription: 'Short Description',
      LongDescription: 'Long Description',
      Links: 'Links',
      Technologies: 'Technologies',
      Degree: 'Degree',
      FieldOfStudy: 'Field of Study',
      Period: 'Period',
      Location: 'Location',
      KeySkillsAcquired: 'Key Skills Acquired',
      ObjectivePurpose: 'Objective / Purpose',
    }
  };

  const t = useCallback((key) => translations[language][key] || key, [language]);

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

        console.log('Raw API data:', { projects, workExperience, skills, hobbies, personalInfo, education });

        const projectsData = projects.data.map(proj => {
          let content = `# ${proj.title || 'Untitled Project'}

## ${t('ShortDescription')}
${proj.short_description || 'No short description available'}

`;

          if (proj.github_url || proj.live_url) {
            content += `## ${t('Links')}\n`;
            if (proj.github_url) content += `GitHub: ${proj.github_url}\n`;
            if (proj.live_url) content += `Live: ${proj.live_url}\n`;
            content += "\n";
          }

          content += `## ${t('LongDescription')}
${proj.long_description || 'No long description available'}

## ${t('Technologies')}
${proj.technologies ? proj.technologies.map(tech => tech.name).join(', ') : 'Not specified'}
`;

          return {
            name: `${proj.title || 'Untitled Project'}.md`,
            content: content
          };
        });

        const workExperienceData = workExperience.data.map(exp => ({
          name: `${exp.position || 'Untitled Position'} - ${exp.company || 'Unnamed Company'}.md`,
          content: `# ${exp.position || 'Untitled Position'} at ${exp.company || 'Unnamed Company'}

## ${t('Period')}
${exp.start_date || 'Not specified'} - ${exp.end_date || 'Present'}

## ${t('ShortDescription')}
${exp.short_description || 'No short description available'}

## ${t('LongDescription')}
${exp.long_description || 'No long description available'}

## ${t('ObjectivePurpose')}
${exp.objectif_but || 'Not specified'}

## ${t('Location')}
${exp.location || 'Not specified'}

## ${t('KeySkillsAcquired')}
${exp.key_learning ? exp.key_learning.map(skill => skill.name).join(', ') : 'Not specified'}
`
        }));

        const skillsData = {
          "Programming Languages": skills.data.filter(skill => skill.type === 'programming_languages').map(skill => skill.name),
          "Hard Skills": skills.data.filter(skill => skill.type === 'hard_skills').map(skill => skill.name),
          "Soft Skills": skills.data.filter(skill => skill.type === 'soft_skills').map(skill => skill.name)
        };

        const hobbiesData = hobbies.data.map(hobby => ({
          name: `${hobby.title || 'Unnamed Hobby'}.md`,
          content: `# ${hobby.title || 'Unnamed Hobby'}

## ${t('ShortDescription')}
${hobby.short_description || 'No short description available'}

## ${t('LongDescription')}
${hobby.long_description || 'No long description available'}
`
        }));

        // Ajoutez ceci pour vérifier le contenu de hobbiesData
        console.log('Hobbies data processed:', hobbiesData);

        const personalInfoData = personalInfo.data[0] || {};

        const educationData = education.data.map(edu => ({
          name: `${edu.institution || 'Unnamed Institution'}.md`,
          content: `# ${edu.institution || 'Unnamed Institution'}

## ${t('Degree')}
${edu.degree || 'Not specified'}

## ${t('FieldOfStudy')}
${edu.field_of_study || 'Not specified'}

## ${t('ShortDescription')}
${edu.description || 'No description available'}

## ${t('Period')}
${edu.start_date || 'Not specified'} - ${edu.end_date || 'Present'}

## ${t('Location')}
${edu.location || 'Not specified'}

## ${t('KeySkillsAcquired')}
${edu.key_learning ? edu.key_learning.map(skill => skill.name).join(', ') : 'Not specified'}
`
        }));

        const newCvStructure = {
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
        };

        console.log('Processed CV structure:', newCvStructure);

        setCvStructure(newCvStructure);
        setExpandedFolders({ [t('Personal')]: true });
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données du CV:', error);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language, t]);

  const toggleFolder = useCallback((folder) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  }, []);

  const handleFileClick = useCallback((file) => {
    console.log('File clicked in Explorer:', file);
    addActiveFile(file);
  }, [addActiveFile]);

  const renderTree = useCallback((tree, path = '') => {
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
                onClick={() => handleFileClick({ section: currentPath, name: item.name, content: item.content })}
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
              onClick={() => handleFileClick({ section: path, name: value.name, content: value.content })}
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
      return null;
    });
  }, [expandedFolders, handleFileClick, toggleFolder]);

  if (isLoading) return <div className="p-4">Chargement de l'explorateur...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full h-full bg-[var(--bg-secondary)] flex flex-col text-sm text-[var(--text-primary)] overflow-hidden">
      <div className="p-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">Explorer</div>
      <div className="flex-1 overflow-y-auto">
        {renderTree(cvStructure)}
      </div>
      {debugContent && (
        <div className="p-2 border-t border-gray-700">
          <h3 className="font-bold">Debug Content:</h3>
          <pre className="text-xs overflow-auto max-h-40">{debugContent}</pre>
        </div>
      )}
    </div>
  );
};

export default Explorer;
