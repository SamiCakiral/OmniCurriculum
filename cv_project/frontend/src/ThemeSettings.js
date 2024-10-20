import React from 'react';

const ThemeSettings = ({ setTheme, closeSettings }) => {
  const themes = ['Sombre', 'Clair'];

  return (
    <div className="absolute top-0 right-0 w-64 h-full bg-[#252526] text-white p-4">
      <h2 className="text-lg font-bold mb-4">Paramètres du thème</h2>
      <div className="space-y-2">
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => {
              setTheme(theme.toLowerCase());
              closeSettings();
            }}
            className="w-full text-left p-2 hover:bg-[#2d2d2d]"
          >
            {theme}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSettings;