import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CVPanel.css';
import { API_URL } from '../config';
const CVPanel = ({ isOpen, onClose }) => {
  const [cvContent, setCvContent] = useState('');
  const [cvData, setCvData] = useState(null);
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('fr'); // Ajout de l'état pour la langue
  const cvRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchCVTemplate = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cv-html/?lang=${lang}&theme=${theme}`);
        setCvContent(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du template CV:', error);
        setCvContent('<p>Erreur lors du chargement du CV.</p>');
      }
    };

    const fetchCvData = async () => {
      try {
        const [personalInfo, education, workExperience, skills, projects, hobbies] = await Promise.all([
          axios.get(`${API_URL}/api/personal-info/?lang=${lang}`),
          axios.get(`${API_URL}/api/education/?lang=${lang}`),
          axios.get(`${API_URL}/api/work-experience/?lang=${lang}`),
          axios.get(`${API_URL}/api/skills/`),
          axios.get(`${API_URL}/api/projects/?lang=${lang}`),
          axios.get(`${API_URL}/api/hobbies/?lang=${lang}`)
        ]);

        setCvData({
          personalInfo: personalInfo.data[0],
          education: education.data.map(edu => ({
            ...edu,
            description: edu.short_description || 'Pas de description disponible'
          })),
          workExperience: workExperience.data.map(exp => ({
            ...exp,
            description: exp.short_description || 'Pas de description disponible'
          })),
          skills: {
            programmingLanguages: skills.data.filter(skill => skill.type === 'programming_languages').map(skill => skill.name),
            hardSkills: skills.data.filter(skill => skill.type === 'hard_skills').map(skill => skill.name),
            softSkills: skills.data.filter(skill => skill.type === 'soft_skills').map(skill => skill.name)
          },
          projects: projects.data.map(proj => ({
            ...proj,
            description: proj.short_description || 'Pas de description disponible'
          })),
          hobbies: hobbies.data.map(hobby => ({
            ...hobby,
            description: hobby.short_description || 'Pas de description disponible'
          }))
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données du CV :', error);
      }
    };

    if (isOpen) {
      fetchCVTemplate();
      fetchCvData();
    }
  }, [isOpen, lang, theme]);

  useEffect(() => {
    if (cvContent && cvData) {
      let updatedContent = cvContent;
      const { personalInfo, education, workExperience, skills, projects, hobbies } = cvData;

      // Remplacer les données personnelles
      updatedContent = updatedContent.replace('{{name}}', personalInfo.name);
      updatedContent = updatedContent.replace('{{title}}', personalInfo.title);
      updatedContent = updatedContent.replace('{{email}}', personalInfo.email);
      updatedContent = updatedContent.replace('{{phone}}', personalInfo.phone);
      updatedContent = updatedContent.replace('{{summary}}', personalInfo.summary);

      // Remplacer les compétences
      const skillsHtml = Object.entries(skills).map(([category, skillList]) => `
        <h3>${category}</h3>
        ${skillList.map(skill => `<span class="tag">${skill}</span>`).join('')}
      `).join('');
      updatedContent = updatedContent.replace('{{skills}}', skillsHtml);

      // Remplacer l'expérience professionnelle
      const experienceHtml = workExperience.map(exp => `
        <div class="experience-item">
          <p><span class="company">${exp.company}</span> - ${exp.position}</p>
          <p class="date">${exp.start_date} - ${exp.end_date || 'Présent'}</p>
          <p>${exp.description}</p>
        </div>
      `).join('');
      updatedContent = updatedContent.replace('{{work_experience}}', experienceHtml);

      // Remplacer les projets
      const projectsHtml = projects.map(project => `
        <div class="project-item">
          <p><span class="project-title">${project.title}</span></p>
          <p>${project.description}</p>
        </div>
      `).join('');
      updatedContent = updatedContent.replace('{{projects}}', projectsHtml);

      // Remplacer la formation
      const educationHtml = education.map(edu => `
        <p><strong>${edu.degree}</strong> - ${edu.institution}, ${edu.end_date}</p>
        <p>${edu.description}</p>
      `).join('');
      updatedContent = updatedContent.replace('{{education}}', educationHtml);

      // Remplacer les hobbies
      const hobbiesHtml = hobbies.map(hobby => `
        <p><strong>${hobby.title}</strong> - ${hobby.description}</p>
      `).join('');
      updatedContent = updatedContent.replace('{{hobbies}}', hobbiesHtml);

      setCvContent(updatedContent);
    }
  }, [cvContent, cvData]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    setLang(prevLang => prevLang === 'fr' ? 'en' : 'fr');
    
  };

  const handleDownloadPDF = () => {
    // Créer l'URL avec les paramètres de langue et de thème
    const url = `${API_URL}/cv/?lang=${lang}&theme=${theme}&print=true`;
      
    // Ouvrir l'URL dans un nouvel onglet
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className={`cv-panel-overlay ${theme}`}>
      <div className="cv-panel">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="cv-panel-content">
          <div 
            ref={cvRef}
            className={`cv-preview ${theme}`}
            dangerouslySetInnerHTML={{ __html: cvContent }}
          />
          <div className="cv-options">
            <h2>Options</h2>
            <button className="theme-button" onClick={toggleTheme}>
              Thème : {theme === 'dark' ? 'Sombre' : 'Clair'}
            </button>
            <button className="theme-button" onClick={toggleLang}>
              Langue : {lang === 'fr' ? 'Français' : 'English'}
            </button>
            {isGeneratingPDF ? (
              <div className="loading-pdf">
                <div className="spinner"></div>
                <p>Génération de votre PDF en cours...</p>
              </div>
            ) : (
              <button className="download-button" onClick={handleDownloadPDF}>
                Télécharger le CV en PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPanel;
