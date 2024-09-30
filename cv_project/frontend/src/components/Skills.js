import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Skills() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/skills/')
      .then(response => setSkills(response.data))
      .catch(error => console.error('Erreur lors de la récupération des compétences:', error));
  }, []);

  return (
    <div>
      <h2>Compétences</h2>
      {skills.map((skill, index) => (
        <div key={index}>
          <h3>{skill.name}</h3>
          {skill.level && <p>Niveau: {skill.level}</p>}
        </div>
      ))}
    </div>
  );
}

export default Skills;