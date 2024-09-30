import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PersonalInfo() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/personal-info/')
      .then(response => setInfo(response.data[0]))
      .catch(error => console.error('Error fetching personal info:', error));
  }, []);

  if (!info) return <div>Loading personal information...</div>;

  return (
    <div>
      <h2>Informations Personnelles</h2>
      <p>Nom: {info.name}</p>
      <p>Email: {info.email}</p>
      <p>Téléphone: {info.phone}</p>
      <p>Résumé: {info.summary}</p>
    </div>
  );
}

export default PersonalInfo;