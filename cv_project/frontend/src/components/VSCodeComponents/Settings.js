import React from 'react';

const Settings = ({ currentTheme, setTheme }) => {
  const themes = [
    { name: 'Sombre', value: 'dark' },
    { name: 'Clair', value: 'light' },
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
    </div>
  );
};

export default Settings;
