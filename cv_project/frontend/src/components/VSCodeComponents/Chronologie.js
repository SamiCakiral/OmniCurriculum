import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chronologie = () => {
  const [chronologieItems, setChronologieItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [education, workExperience] = await Promise.all([
          axios.get('http://localhost:8000/api/education/'),
          axios.get('http://localhost:8000/api/work-experience/')
        ]);

        const items = [
          ...education.data.map(edu => ({
            title: edu.institution,
            date: edu.start_date,
            type: 'education'
          })),
          ...workExperience.data.map(exp => ({
            title: exp.position,
            date: exp.start_date,
            type: 'work'
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setChronologieItems(items);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données de la chronologie:', error);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div className="p-4">Chargement de la chronologie...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full h-full bg-[var(--bg-secondary)] text-[var(--text-primary)] flex flex-col overflow-hidden">
      <div className="p-2 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">Chronologie</div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          {chronologieItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${item.type === 'education' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
              <div className="w-10 h-px bg-gray-600 mx-2"></div>
              <div className="flex flex-col">
                <div className="text-xs whitespace-nowrap">{item.title}</div>
                <div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chronologie;
