import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/solid';
import { API_URL } from '../../config';

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
          axios.get(`${API_URL}/api/projects/?lang=${language}`), 
          axios.get(`${API_URL}/api/work-experience/?lang=${language}`),
          axios.get(`${API_URL}/api/skills/`),
          axios.get(`${API_URL}/api/hobbies/?lang=${language}`),
          axios.get(`${API_URL}/api/personal-info/?lang=${language}`),
          axios.get(`${API_URL}/api/education/?lang=${language}`)
        ]);

        console.log('Raw API data:', { projects, workExperience, skills, hobbies, personalInfo, education });

        const projectsData = projects.data.map(proj => {
          let content = `# ${proj.title || 'Untitled Project'}

${proj.short_description ? `## ${t('ShortDescription')}\n${proj.short_description}\n\n` : ''}`;

          if (proj.github_url || proj.live_url) {
            content += `## ${t('Links')}\n`;
            if (proj.github_url) content += `GitHub: [${proj.github_url}](${proj.github_url})\n`;
            if (proj.live_url) content += `Live: [${proj.live_url}](${proj.live_url})\n`;
            content += "\n";
          }

          content += proj.long_description ? `## ${t('LongDescription')}\n${proj.long_description}\n\n` : '';
          
          if (proj.technologies?.length) {
            content += `## ${t('Technologies')}\n${proj.technologies.map(tech => tech.name).join(', ')}\n\n`;
          }

          if (proj.key_learning?.length) {
            content += `## ${t('KeySkillsAcquired')}\n${proj.key_learning.join(', ')}`;
          }

          return {
            name: `${proj.title || 'Untitled Project'}.md`,
            content: content.trim()
          };
        });

        const workExperienceData = workExperience.data.map(exp => {
          let content = `# ${exp.position || 'Untitled Position'} at ${exp.company || 'Unnamed Company'}

${exp.start_date || exp.end_date ? `## ${t('Period')}\n${exp.start_date || 'Not specified'} - ${exp.end_date || 'Present'}\n\n` : ''}`;

          if (exp.short_description) {
            content += `## ${t('ShortDescription')}\n${exp.short_description}\n\n`;
          }

          if (exp.long_description) {
            content += `## ${t('LongDescription')}\n${exp.long_description}\n\n`;
          }

          if (exp.objectif_but) {
            content += `## ${t('ObjectivePurpose')}\n${exp.objectif_but}\n\n`;
          }

          if (exp.location) {
            content += `## ${t('Location')}\n${exp.location}\n\n`;
          }

          if (exp.key_learning?.length) {
            content += `## ${t('KeySkillsAcquired')}\n${exp.key_learning.join(', ')}`;
          }

          return {
            name: `${exp.position || 'Untitled Position'} - ${exp.company || 'Unnamed Company'}.md`,
            content: content.trim()
          };
        });

        const educationData = education.data.map(edu => {
          let content = `# ${edu.institution || 'Unnamed Institution'}

${edu.degree ? `## ${t('Degree')}\n${edu.degree}\n\n` : ''}`;

          if (edu.field_of_study) {
            content += `## ${t('FieldOfStudy')}\n${edu.field_of_study}\n\n`;
          }

          if (edu.description) {
            content += `## ${t('ShortDescription')}\n${edu.description}\n\n`;
          }

          if (edu.start_date || edu.end_date) {
            content += `## ${t('Period')}\n${edu.start_date || 'Not specified'} - ${edu.end_date || 'Present'}\n\n`;
          }

          if (edu.location) {
            content += `## ${t('Location')}\n${edu.location}\n\n`;
          }

          if (edu.key_learning?.length) {
            content += `## ${t('KeySkillsAcquired')}\n${edu.key_learning.join(', ')}`;
          }

          return {
            name: `${edu.institution || 'Unnamed Institution'}.md`,
            content: content.trim()
          };
        });

        const hobbiesData = hobbies.data.map(hobby => ({
          name: `${hobby.title || 'Unnamed Hobby'}.md`,
          content: `# ${hobby.title || 'Unnamed Hobby'}

${hobby.short_description ? `## ${t('ShortDescription')}\n${hobby.short_description}\n\n` : ''}${hobby.long_description ? `## ${t('LongDescription')}\n${hobby.long_description}` : ''}`.trim()
        }));

        const personalInfoData = personalInfo.data[0] || {};

        const newCvStructure = {
          [t('Projects')]: projectsData,
          [t('JobsInternships')]: workExperienceData,
          [t('Education')]: educationData,
          [t('Personal')]: {
            [t('Hobbies')]: hobbiesData,
            'skills.json': {
              name: 'All_Skills.json',
              content: JSON.stringify(
                Object.fromEntries(
                  Object.entries({
                    "Programming Languages": skills.data.filter(skill => skill.type === 'programming_languages').map(skill => skill.name),
                    "Hard Skills": skills.data.filter(skill => skill.type === 'hard_skills').map(skill => skill.name),
                    "Soft Skills": skills.data.filter(skill => skill.type === 'soft_skills').map(skill => skill.name),
                    "Work Skills": skills.data.filter(skill => skill.type === 'work').map(skill => skill.name),
                    "Education Skills": skills.data.filter(skill => skill.type === 'education').map(skill => skill.name),
                    "Project Technologies": projects.data.flatMap(proj => proj.technologies || [])
                      .filter((value, index, self) => self.indexOf(value) === index)
                  }).filter(([_, values]) => values.length > 0)
                ), null, 2)
            },
            'personalInfo.json': {
              name: 'personalInfo.json',
              content: JSON.stringify(personalInfo.data[0] || {}, null, 2)
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
              <FolderIcon className="w-5 h-5 min-w-[1.25rem] mr-2 text-yellow-500" />
              <span>{key}</span>
            </div>
            {expandedFolders[currentPath] && value.map(item => (
              <div
                key={`${currentPath}/${item.name}`}
                className="flex items-center ml-4 cursor-pointer hover:bg-[var(--hover-bg)] py-1"
                onClick={() => handleFileClick({ section: currentPath, name: item.name, content: item.content })}
              >
                <DocumentTextIcon className="w-5 h-5 min-w-[1.25rem] mr-2 text-blue-400" />
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
              <DocumentTextIcon className="w-5 h-5 min-w-[1.25rem] mr-2 text-blue-400" />
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
                <FolderIcon className="w-5 h-5 min-w-[1.25rem] mr-2 text-yellow-500" />
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
