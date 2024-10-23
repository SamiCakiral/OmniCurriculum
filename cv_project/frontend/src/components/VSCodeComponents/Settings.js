import React from 'react';

const translations = {
  fr: {
    settings: "Paramètres",
    theme: "Thème :",
    language: "Langue :",
    dark: "Sombre",
    light: "Clair",
    french: "Français",
    english: "Anglais",
  },
  en: {
    settings: "Settings",
    theme: "Theme:",
    language: "Language:",
    dark: "Dark",
    light: "Light",
    french: "French",
    english: "English",
  }
};

const Settings = ({ currentTheme, setTheme, language, setLanguage }) => {
  const themes = [
    { name: 'Sombre', value: 'dark' },
    { name: 'Clair', value: 'light' },
  ];

  const languages = [
    { name: 'Français', value: 'fr' },
    { name: 'English', value: 'en' },
  ];

  const t = (key) => translations[language][key] || key;

  return (
    <div className="p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <h2 className="text-xl mb-4">{t('settings')}</h2>
      <div className="mb-4">
        <label className="block mb-2">{t('theme')}</label>
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
        <label className="block mb-2">{t('language')}</label>
        <select 
          value={language} 
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
