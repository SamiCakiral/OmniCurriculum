import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Console = () => {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/personal-info/');
        if (response.data.length > 0) {
          setPersonalInfo(response.data[0]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching personal info:', error);
        setError('Erreur lors du chargement des informations personnelles.');
        setIsLoading(false);
      }
    };

    fetchPersonalInfo();
  }, []);

  if (isLoading) return <div className="h-full bg-black text-green-400 p-4">Chargement des informations personnelles...</div>;
  if (error) return <div className="h-full bg-black text-red-500 p-4">{error}</div>;
  if (!personalInfo) return <div className="h-full bg-black text-yellow-500 p-4">Aucune information personnelle trouvée.</div>;

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] overflow-hidden flex flex-col">
      <div className="bg-[#252526] px-4 py-2 text-xs font-bold uppercase tracking-wide">Console</div>
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
          {`> console.log(personalInfo)
{
  name: "${personalInfo.name}",
  email: "${personalInfo.email}",
  phone: "${personalInfo.phone}",
  summary: "${personalInfo.summary}"
}`}
        </pre>
      </div>
    </div>
  );
};

export default Console;