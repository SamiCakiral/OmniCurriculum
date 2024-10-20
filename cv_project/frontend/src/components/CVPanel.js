import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './CVPanel.css';

const CVPanel = ({ isOpen, onClose }) => {
  const [cvContent, setCvContent] = useState('');
  const [theme, setTheme] = useState('dark');
  const cvRef = useRef(null);

  useEffect(() => {
    const fetchCVTemplate = async () => {
      try {
        const response = await axios.get('/CVTemplate.html');
        setCvContent(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du template CV:', error);
        setCvContent('<p>Erreur lors du chargement du CV.</p>');
      }
    };

    if (isOpen) {
      fetchCVTemplate();
    }
  }, [isOpen]);

  useEffect(() => {
    // Appliquer le thème au contenu du CV
    if (cvRef.current) {
      cvRef.current.querySelectorAll('*').forEach(el => {
        el.classList.remove('dark', 'light');
        el.classList.add(theme);
      });
    }
  }, [theme, cvContent]);

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
