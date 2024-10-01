import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WorkExperience() {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/work-experience/')
      .then(response => setExperiences(response.data))
      .catch(error => console.error('Erreur lors de la récupération des expériences professionnelles:', error));
  }, []);

  if (experiences.length === 0) return <div className="text-center">Chargement des expériences professionnelles...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-4">Expérience Professionnelle</h2>
      {experiences.map((exp, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-xl font-semibold">{exp.position}</h3>
          <p className="text-lg">{exp.company}</p>
          <p className="text-gray-600">{new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Présent'}</p>
          <p className="text-gray-700">{exp.description}</p>
        </div>
      ))}
    </div>
  );
}

export default WorkExperience;
