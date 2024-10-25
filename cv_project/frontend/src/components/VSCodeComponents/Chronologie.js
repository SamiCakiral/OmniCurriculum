import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const translations = {
  fr: {
    loading: "Chargement de la chronologie...",
    error: "Erreur lors du chargement des données. Veuillez réessayer.",
    timeline: "Chronologie",
    present: "Présent",
  },
  en: {
    loading: "Loading timeline...",
    error: "Error loading data. Please try again.",
    timeline: "Timeline",
    present: "Present",
  }
};

const Chronologie = ({ language, addActiveFile }) => {
  const [chronologieItems, setChronologieItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const t = useCallback((key) => translations[language][key] || key, [language]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [education, workExperience] = await Promise.all([
          axios.get(`${API_URL}/api/education/?lang=${language}`),
          axios.get(`${API_URL}/api/work-experience/?lang=${language}`)
        ]);

        const items = [
          ...education.data.map(edu => ({
            title: edu.degree,
            subtitle: edu.institution,
            startDate: edu.start_date,
            endDate: edu.end_date,
            description: edu.description,
            type: 'education'
          })),
          ...workExperience.data.map(exp => ({
            title: exp.position,
            subtitle: exp.company,
            startDate: exp.start_date,
            endDate: exp.end_date,
            description: exp.short_description,
            type: 'work'
          }))
        ].sort((a, b) => {
          if (a.endDate === null || a.endDate === 'Présent') return -1;
          if (b.endDate === null || b.endDate === 'Présent') return 1;
          return new Date(b.startDate) - new Date(a.startDate);
        });

        setChronologieItems(items);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données de la chronologie:', error);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  const handleItemClick = useCallback((item) => {
    console.log("Item clicked:", item);  // Ajout d'un log pour le débogage
    // Vous pouvez ajouter ici une logique pour gérer le clic sur un élément si nécessaire
  }, []);

  if (isLoading) return <div className="p-4">{t('loading')}</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full h-full bg-[var(--bg-secondary)] text-[var(--text-primary)] flex flex-col overflow-hidden">
      <div className="p-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">{t('timeline')}</div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          {chronologieItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-start cursor-pointer hover:bg-[var(--hover-bg)]" 
              onClick={() => handleItemClick(item)}
            >
              <div className={`w-3 h-3 min-w-[0.75rem] mt-1 rounded-full ${
                item.type === 'education' ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
              <div className="w-10 h-px bg-gray-600 mx-2 mt-2"></div>
              <div className="flex flex-col">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs">{item.subtitle}</div>
                <div className="text-xs text-gray-500">
                  {new Date(item.startDate).toLocaleDateString()} - 
                  {item.endDate ? new Date(item.endDate).toLocaleDateString() : t('present')}
                </div>
                <div className="text-xs mt-1">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chronologie;
