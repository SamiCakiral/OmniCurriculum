import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatusBar = () => {
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchSkillsAndLanguages = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/skills/');
        const allSkills = response.data;
        
        // Séparer les compétences techniques et les langues
        const techSkills = allSkills.filter(skill => !['English', 'French', 'Spanish', 'Turkish'].includes(skill.name));
        const langs = allSkills.filter(skill => ['English', 'French', 'Spanish', 'Turkish'].includes(skill.name));
        
        setSkills(techSkills.slice(0, 3)); // Afficher seulement les 3 premières compétences
        setLanguages(langs);
      } catch (error) {
        console.error('Error fetching skills and languages:', error);
      }
    };

    fetchSkillsAndLanguages();
  }, []);

  return (
    <div className="bg-blue-600 text-white text-xs flex items-center justify-between px-4 py-1">
      <div className="flex space-x-4">
        {skills.map((skill, index) => (
          <span key={index}>{skill.name}</span>
        ))}
      </div>
      <div className="flex space-x-4">
        {languages.map((lang, index) => (
          <span key={index}>{lang.name}</span>
        ))}
      </div>
      <div>Sami Cakiral CV</div>
    </div>
  );
};

export default StatusBar;
