import React, { useState, useEffect } from 'react';
import VSCodeTheme from './components/VSCodeTheme';
import { detectLanguage } from './utils/languageDetection';
import './styles/loading.css'; // Créez ce fichier pour les styles du loader

function App() {
  const [language, setLanguage] = useState('en');
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Détection de la taille d'écran
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      if (isMobileDevice && !sessionStorage.getItem('mobileWarningShown')) {
        setShowMobileWarning(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Chargement initial
  useEffect(() => {
    const initializeApp = async () => {
      const detectedLanguage = detectLanguage();
      setLanguage(detectedLanguage);
      setLanguageLoaded(true);
      
      // Simuler un temps de chargement minimum pour l'animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoading(false);
    };

    initializeApp();
  }, []);

  // Composant Modal d'avertissement mobile
  const MobileWarningModal = () => (
    <div className="mobile-warning-modal">
      <div className="modal-content">
        <h2>{language === 'fr' ? 'Attention !' : 'Warning!'}</h2>
        <p>
          {language === 'fr' 
            ? "Cette application est optimisée pour une utilisation sur ordinateur. L'expérience sur mobile pourrait être dégradée."
            : "This application is optimized for desktop use. The mobile experience might be degraded."}
        </p>
        <div className="modal-buttons">
          <button onClick={() => {
            setShowMobileWarning(false);
            sessionStorage.setItem('mobileWarningShown', 'true');
          }}>
            {language === 'fr' ? 'Continuer quand même' : 'Continue anyway'}
          </button>
          <a href="https://omnicurriculum-cakiral-sami.ew.r.appspot.com/cv" className="button">
            {language === 'fr' ? 'Voir version PDF' : 'View PDF version'}
          </a>
        </div>
      </div>
    </div>
  );

  // Composant de chargement
  const LoadingScreen = () => (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="code-loader">
          <span>{'{'}</span>
          <span>...</span>
          <span>{'}'}</span>
        </div>
        <p>{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      {showMobileWarning && <MobileWarningModal />}
      <VSCodeTheme 
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}

export default App;
