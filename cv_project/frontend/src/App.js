import React, { useState, useEffect } from 'react';
import VSCodeTheme from './components/VSCodeTheme';
import { detectLanguage } from './utils/languageDetection';

function App() {
  const [language, setLanguage] = useState('en'); // Anglais par défaut
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [theme, setTheme] = useState('dark'); // 'dark' comme thème par défaut

  useEffect(() => {
    const detectedLanguage = detectLanguage();
    setLanguage(detectedLanguage);
    setLanguageLoaded(true);
  }, []);

  if (!languageLoaded) {
    return <div>Chargement...</div>; // ou un composant de chargement
  }

  return (
    <div className="App">
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
