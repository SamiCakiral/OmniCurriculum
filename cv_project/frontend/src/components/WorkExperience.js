import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WorkExperience() {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/work-experiences/')
      .then(response => setExperiences(response.data))
      .catch(error => console.error('Erreur lors de la récupération des expériences professionnelles:', error));
  }, []);

  return (
    <div>
      <h2>Expérience Professionnelle</h2>
      {experiences.map((exp, index) => (
        <div key={index}>
          <h3>{exp.company}</h3>
          <p>{exp.position}</p>
          <p>{new Date(exp.start_date).getFullYear()} - {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Présent'}</p>
          <p>{exp.description}</p>
        </div>
      ))}
    </div>
  );
}

export default WorkExperience;
