import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/solid';
import Chronologie from './Chronologie';

const Explorer = ({ addActiveFile }) => {
  const [cvStructure, setCvStructure] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chronologieItems, setChronologieItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [projects, skills, education, workExperience] = await Promise.all([
          axios.get('http://localhost:8000/api/projects/'),
          axios.get('http://localhost:8000/api/skills/'),
          axios.get('http://localhost:8000/api/education/'),
          axios.get('http://localhost:8000/api/work-experience/')
        ]);

        setCvStructure({
          'Projets': projects.data.map(proj => proj.title),
          'Compétences': ['Techniques', 'Langues', 'Soft Skills']
        });

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
    <div className="w-64 bg-[#1e1e1e] flex flex-col h-full text-sm text-[#cccccc]">
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 text-xs font-bold uppercase tracking-wide">Explorer</div>
        {renderTree(cvStructure)}
      </div>
      <Chronologie items={chronologieItems} />
    </div>
  );
};

export default Explorer;