import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Console = ({ language }) => {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/personal-info/?lang=${language}`);
        if (response.data.length > 0) {
          setPersonalInfo(response.data[0]);
          setMessages([`> Bonjour je suis ${response.data[0].name} voulez vous me parler ici ? (Propulsé par Mistral AI 7B)`]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching personal info:', error);
        setError('Erreur lors du chargement des informations personnelles.');
        setIsLoading(false);
      }
    };

    fetchPersonalInfo();
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    setMessages(prev => [...prev, `> ${inputMessage}`]);
    setInputMessage('');

    // Simuler une réponse du chatbot
    setTimeout(() => {
      setMessages(prev => [...prev, `Réponse simulée du chatbot à : ${inputMessage}`]);
    }, 1000);
  };

  if (isLoading) return <div className="h-full bg-[var(--bg-primary)] text-[var(--accent-color)] p-4">Chargement des informations personnelles...</div>;
  if (error) return <div className="h-full bg-[var(--bg-primary)] text-red-500 p-4">{error}</div>;
  if (!personalInfo) return <div className="h-full bg-[var(--bg-primary)] text-yellow-500 p-4">Aucune information personnelle trouvée.</div>;

  return (
    <div className="h-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      <div className="bg-[var(--bg-secondary)] px-4 py-2 text-xs font-bold uppercase tracking-wide flex justify-between items-center">
        <span>Console</span>
        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">_</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <pre className="text-xs font-mono whitespace-pre-wrap mb-4">
            {`> console.log(personalInfo)
{
  name: "${personalInfo.name}",
  title: "${personalInfo.title}",
  email: "${personalInfo.email}",
  phone: "${personalInfo.phone}",
  years_of_experience: ${personalInfo.years_of_experience},
  has_vehicle: ${personalInfo.has_vehicle},
  region: "${personalInfo.region}",
  linkedin_url: "${personalInfo.linkedin_url}",
  github_url: "${personalInfo.github_url}",
  github_username: "${personalInfo.github_username}",
  summary: "${personalInfo.summary}"
}`}
          </pre>
          {messages.map((message, index) => (
            <div key={index} className="mb-2 text-xs font-mono">{message}</div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSendMessage} className="p-2 bg-[var(--bg-secondary)] flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-[var(--bg-primary)] text-[var(--text-primary)] p-2 text-xs font-mono"
          placeholder="Tapez votre message ici..."
        />
        <button type="submit" className="ml-2 px-4 py-2 bg-[var(--accent-color)] text-white text-xs">Envoyer</button>
      </form>
    </div>
  );
};

export default Console;
