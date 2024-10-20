import React, { useState } from 'react';
import VSCodeTheme from './components/VSCodeTheme';

function App() {
  const [language, setLanguage] = useState('fr'); // 'fr' comme valeur par défaut
  const [theme, setTheme] = useState('dark'); // 'dark' comme thème par défaut

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
