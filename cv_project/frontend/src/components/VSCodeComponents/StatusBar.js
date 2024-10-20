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
        
        const techSkills = allSkills.filter(skill => !['English', 'French', 'Spanish', 'Turkish'].includes(skill.name));
        const langs = allSkills.filter(skill => ['English', 'French', 'Spanish', 'Turkish'].includes(skill.name));
        
        setSkills(techSkills.slice(0, 3));
        setLanguages(langs);
      } catch (error) {
        console.error('Error fetching skills and languages:', error);
      }
    };

    fetchSkillsAndLanguages();
  }, []);

  return (
    <div className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs flex items-center justify-between px-4 py-1">
      <div className="flex space-x-4">
        {skills.map((skill, index) => (
          <span key={index} className="hover:text-[var(--text-primary)]">{skill.name}</span>
        ))}
      </div>
      <div className="flex space-x-4">
        {languages.map((lang, index) => (
          <span key={index} className="hover:text-[var(--text-primary)]">{lang.name}</span>
        ))}
      </div>
      <div className="hover:text-[var(--text-primary)]">Sami Cakiral CV</div>
    </div>
  );
};

export default StatusBar;
