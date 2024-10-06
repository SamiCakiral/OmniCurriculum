import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/solid';

const Explorer = ({ addActiveFile }) => {
  const [cvStructure, setCvStructure] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, skills] = await Promise.all([
          axios.get('http://localhost:8000/api/projects/'),
          axios.get('http://localhost:8000/api/skills/'),
        ]);

        setCvStructure({
          'Projets': projects.data.map(proj => proj.title),
          'Compétences': ['Techniques', 'Langues', 'Soft Skills']
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données du CV:', error);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const renderTree = (tree) => {
    return Object.entries(tree).map(([key, value]) => (
      <div key={key} className="ml-4">
        <div
          className="flex items-center cursor-pointer hover:bg-gray-700 py-1"
          onClick={() => toggleFolder(key)}
        >
          <FolderIcon className="w-4 h-4 mr-2 text-yellow-500" />
          <span>{key}</span>
        </div>
        {expandedFolders[key] && value.map(file => (
          <div
            key={file}
            className="flex items-center ml-4 cursor-pointer hover:bg-gray-700 py-1"
            onClick={() => addActiveFile({ section: key, name: file })}
          >
            <DocumentTextIcon className="w-4 h-4 mr-2 text-blue-400" />
            <span>{file}</span>
          </div>
        ))}
      </div>
    ));
  };

  if (isLoading) return <div className="p-4">Chargement de l'explorateur...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full h-full bg-[#1e1e1e] flex flex-col text-sm text-[#cccccc] overflow-y-auto">
      <div className="p-2 text-xs font-bold uppercase tracking-wide">Explorer</div>
      {renderTree(cvStructure)}
    </div>
  );
};

export default Explorer;