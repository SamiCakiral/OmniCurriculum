import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './CVPanel.css';

const CVPanel = ({ isOpen, onClose }) => {
  const [cvData, setCvData] = useState({
    personalInfo: null,
    education: [],
    workExperience: [],
    skills: [],
    projects: []
  });
  const [theme, setTheme] = useState('dark');
  const cvRef = useRef(null);

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
      fetchCvData();
    }
  }, [isOpen]);

  const handleDownload = () => {
    const element = cvRef.current;
    html2pdf().from(element).save('Sami_Cakiral_CV.pdf');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!isOpen) return null;

  return (
    <div className="cv-panel-overlay">
      <div className="cv-panel">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="cv-panel-content">
          <div className="cv-preview">
            <div id="cv-content" ref={cvRef} className={`cv-content ${theme}`}>
              <div className="container">
                <div className="sidebar">
                  <img src="profile-pic.jpg" alt="Photo professionnelle" className="profile-pic" width="150" height="150" />
                  <h1>{cvData.personalInfo?.name}</h1>
                  <p>{cvData.personalInfo?.title}</p>
                  <div>
                    {cvData.skills.map((skill, index) => (
                      <span key={index} className="tag">{skill.name}</span>
                    ))}
                  </div>
                  <div className="contact-info">
                    <p>📧 <a href={`mailto:${cvData.personalInfo?.email}`}>{cvData.personalInfo?.email}</a></p>
                    <p>📱 {cvData.personalInfo?.phone}</p>
                    {/* Ajoutez d'autres informations de contact si nécessaire */}
                  </div>
                </div>
                <div className="main-content">
                  <h2>// Profil</h2>
                  <p>{cvData.personalInfo?.summary}</p>

                  <h2>// Expérience Professionnelle</h2>
                  {cvData.workExperience.map((exp, index) => (
                    <div key={index} className="experience-item">
                      <p><span className="company">{exp.company}</span> - {exp.position}</p>
                      <p className="date">{exp.start_date} - {exp.end_date || 'Présent'}</p>
                      <p>{exp.description}</p>
                    </div>
                  ))}

                  <h2>// Projets</h2>
                  {cvData.projects.map((project, index) => (
                    <div key={index} className="project-item">
                      <p><span className="project-title">{project.title}</span></p>
                      <p>{project.description}</p>
                    </div>
                  ))}

                  <h2>// Formation</h2>
                  {cvData.education.map((edu, index) => (
                    <p key={index}><strong>{edu.degree}</strong> - {edu.institution}, {edu.end_date}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="cv-options">
            <h2>Options</h2>
            <button className="theme-button" onClick={toggleTheme}>
              Changer le thème ({theme === 'dark' ? 'Sombre' : 'Clair'})
            </button>
            <button className="download-button" onClick={handleDownload}>Télécharger le PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPanel;
