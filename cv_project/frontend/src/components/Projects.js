import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/projects/')
      .then(response => setProjects(response.data))
      .catch(error => console.error('Erreur lors de la récupération des projets:', error));
  }, []);

  return (
    <div>
      <h2>Projets</h2>
      {projects.map((project, index) => (
        <div key={index}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p>Technologies utilisées: {project.technologies}</p>
          <p>Date: {new Date(project.date).getFullYear()}</p>
        </div>
      ))}
    </div>
  );
}

export default Projects;
