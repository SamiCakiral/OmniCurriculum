import React from 'react';

const Settings = ({ currentTheme, setTheme, currentLanguage, setLanguage }) => {
  const themes = [
    { name: 'Sombre', value: 'dark' },
    { name: 'Clair', value: 'light' },
  ];

  const languages = [
    { name: 'Français', value: 'fr' },
    { name: 'English', value: 'en' },
  ];

  return (
    <div className="p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <h2 className="text-xl mb-4">Paramètres</h2>
      <div className="mb-4">
        <label className="block mb-2">Thème :</label>
        <select 
          value={currentTheme} 
          onChange={(e) => setTheme(e.target.value)}
          className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] p-2 rounded"
        >
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Langue :</label>
        <select 
          value={currentLanguage} 
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] p-2 rounded"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Settings;
