import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './CVPanel.css';

const CVPanel = ({ isOpen, onClose }) => {
  const [cvContent, setCvContent] = useState('');
  const [cvData, setCvData] = useState(null);
  const [theme, setTheme] = useState('dark');
  const cvRef = useRef(null);

  useEffect(() => {
    const fetchCVTemplate = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/cv-html/');
        setCvContent(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du template CV:', error);
        setCvContent('<p>Erreur lors du chargement du CV.</p>');
      }
    };

    const fetchCvData = async () => {
      try {
        const [personalInfo, education, workExperience, skills, projects] = await Promise.all([
          axios.get('http://localhost:8000/api/personal-info/'),
          axios.get('http://localhost:8000/api/education/'),
          axios.get('http://localhost:8000/api/work-experience/'),
          axios.get('http://localhost:8000/api/skills/'),
          axios.get('http://localhost:8000/api/projects/')
        ]);

        setCvData({
          personalInfo: personalInfo.data[0],
          education: education.data,
          workExperience: workExperience.data,
          skills: skills.data,
          projects: projects.data
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données du CV :', error);
      }
    };

    if (isOpen) {
      fetchCVTemplate();
      fetchCvData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (cvContent && cvData) {
      let updatedContent = cvContent;
      const { personalInfo, education, workExperience, skills, projects } = cvData;

      // Remplacer les données personnelles
      updatedContent = updatedContent.replace('{{name}}', personalInfo.name);
      updatedContent = updatedContent.replace('{{title}}', personalInfo.title);
      updatedContent = updatedContent.replace('{{email}}', personalInfo.email);
      updatedContent = updatedContent.replace('{{phone}}', personalInfo.phone);
      updatedContent = updatedContent.replace('{{summary}}', personalInfo.summary);

      // Remplacer les compétences
      const skillsHtml = skills.map(skill => `<span class="tag">${skill.name}</span>`).join('');
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
      `).join('');
      updatedContent = updatedContent.replace('{{education}}', educationHtml);

      setCvContent(updatedContent);
    }
  }, [cvContent, cvData]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = cvRef.current;
    const opt = {
      margin:       10,
      filename:     'CV.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
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
            <button className="print-button" onClick={handlePrint}>
              Imprimer le CV
            </button>
            <button className="download-button" onClick={handleDownloadPDF}>
              Télécharger en PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPanel;
