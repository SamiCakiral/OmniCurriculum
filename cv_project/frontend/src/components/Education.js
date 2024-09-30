import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Education() {
  const [education, setEducation] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/education/')
      .then(response => setEducation(response.data))
      .catch(error => console.error('Error fetching education:', error));
  }, []);

  return (
    <div>
      <h2>Formation</h2>
      {education.map((edu, index) => (
        <div key={index}>
          <h3>{edu.institution}</h3>
          <p>{edu.degree} - {edu.field_of_study}</p>
          <p>{new Date(edu.start_date).getFullYear()} - {edu.end_date ? new Date(edu.end_date).getFullYear() : 'Present'}</p>
        </div>
      ))}
    </div>
  );
}

export default Education;