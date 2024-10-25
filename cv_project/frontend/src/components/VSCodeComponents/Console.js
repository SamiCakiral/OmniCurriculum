import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const Console = ({ language, cvStructure }) => {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('~');
  const [isTalkWithMeRunning, setIsTalkWithMeRunning] = useState(false);
  const [isMistralRunning, setIsMistralRunning] = useState(false);
  const messagesEndRef = useRef(null);
  const consoleRef = useRef(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMistralInitialized, setIsMistralInitialized] = useState(false);

  const translations = {
    fr: {
      loading: "Chargement du terminal...",
      connectionError: "Impossible de se connecter au serveur CV.",
      terminal: "Terminal",
      welcomeMessage: "Bienvenue ! Je suis {name}, enfin une version artificielle de moi-même (propulsé par Mistral AI 7B). Posez moi des questions sur moi je serait ravi de répondre ! (tapez 'exit' pour quitter)",
      
    },
    en: {
      loading: "Loading terminal...",
      connectionError: "Unable to connect to CV server.",
      terminal: "Terminal",
      welcomeMessage: "Welcome! I'm {name}, well I am a virtual version of myself (powered by Mistral AI 7B). Ask me questions about me and I'll be happy to answer! (type 'exit' to quit)",
      
    }
  };

  const t = (key, params = {}) => {
    let translation = translations[language][key] || key;
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    return translation;
  };

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      
      setIsLoading(true);
      try {
        const fullUrl = `${API_URL}/api/personal-info/?lang=${language}`;
        const response = await axios.get(fullUrl);
        if (response.data && response.data.length > 0) {
          setPersonalInfo(response.data[0]);
          const reorganizedData = reorganizePersonalInfo(response.data[0]);
          setMessages([
            { type: 'command', content: `➜ ~ ssh ${response.data[0].name.toLowerCase().replace(' ', '')}@cv-server`, status: 'success' },
            { type: 'output', content: `Last login: ${new Date().toLocaleString()}` },
            { type: 'command', content: `${reorganizedData.name.toLowerCase().replace(' ', '')}@cv-server ~ % cat personalInfo.json`, status: 'success' },
            { type: 'output', content: JSON.stringify(reorganizedData, null, 2) },
            { type: 'command', content: `${response.data[0].name.toLowerCase().replace(' ', '')}@cv-server ~ % python talkWithMistral.py`, status: 'success' },
            { type: 'output', content: t('welcomeMessage', { name: response.data[0].name }) }
          ]);
          setIsTalkWithMeRunning(true);
        } else {
          console.warn('No personal info data received');
          setError('Aucune information personnelle disponible');
        }
      } catch (error) {
        console.error('Error fetching personal info:', error.response || error);
        setError(t('connectionError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalInfo();
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCommand = async (command) => {
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'cd':
        handleCd(args[0]);
        break;
      case 'ls':
        handleLs(args.includes('-la'));
        break;
      case 'echo':
        handleEcho(args.join(' '));
        break;
      case 'cat':
        handleCat(args[0]);
        break;
      case 'python':
        if (args[0] === 'talkWithMe.py') {
          setIsTalkWithMeRunning(true);
          addMessage('output', 'Assistant virtuel démarré. Posez vos questions !');
        } else {
          addMessage('output', `Fichier Python non trouvé : ${args[0]}`);
        }
        break;
      case 'exit':
        if (isTalkWithMeRunning) {
          setIsTalkWithMeRunning(false);
          addMessage('output', 'Assistant virtuel arrêté.');
        } else {
          addMessage('output', 'Aucun programme à quitter.');
        }
        break;
      default:
        addMessage('output', `Commande non implémentée : ${cmd}`);
    }
  };

  const handleCd = (dir) => {
    if (dir === '..') {
      if (currentDirectory !== '~') {
        setCurrentDirectory(currentDirectory.split('/').slice(0, -1).join('/') || '~');
      }
    } else if (dir && cvStructure[currentDirectory] && cvStructure[currentDirectory][dir]) {
      setCurrentDirectory(`${currentDirectory}/${dir}`);
    } else {
      addMessage('output', `cd: ${dir}: Aucun fichier ou dossier de ce type`);
    }
  };

  const handleLs = (showHidden) => {
    const currentDirContent = cvStructure[currentDirectory] || {};
    let output = Object.keys(currentDirContent).join('  ');
    if (showHidden && currentDirectory === '~') {
      output += '  .talkWithMe.py';
    }
    addMessage('output', output || 'Dossier vide');
  };

  const handleEcho = (text) => {
    addMessage('output', text);
  };

  const handleCat = (file) => {
    const currentDirContent = cvStructure[currentDirectory] || {};
    if (currentDirContent[file]) {
      addMessage('output', currentDirContent[file].content);
    } else {
      addMessage('output', `cat: ${file}: Aucun fichier ou dossier de ce type`);
    }
  };

  const addMessage = (type, content, isUpdate = false) => {
    setMessages(prev => {
      if (isUpdate && prev.length > 0) {
        // Mise à jour du dernier message pour le streaming
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { type, content };
        return newMessages;
      }
      // Ajout d'un nouveau message
      return [...prev, { type, content }];
    });
  };

  const handleKeyDown = (e) => {
    e.preventDefault();

    switch (e.key) {
      case 'Enter':
        if (inputMessage.trim() === '') return;

        setCommandHistory(prev => [inputMessage, ...prev]);
        setHistoryIndex(-1);

        if (isTalkWithMeRunning) {
          if (inputMessage.toLowerCase() === 'exit') {
            setIsTalkWithMeRunning(false);
            addMessage('command', '> exit');
            addMessage('output', 'Assistant virtuel arrêté.');
          } else {
            handleMistralInteraction(inputMessage);
          }
        } else {
          addMessage('command', `${personalInfo.name.toLowerCase().replace(' ', '')}@cv-server ${currentDirectory} % ${inputMessage}`);
          handleCommand(inputMessage);
        }

        setInputMessage('');
        break;

      case 'Backspace':
        setInputMessage(prev => prev.slice(0, -1));
        break;

      case 'ArrowLeft':
        // Déplacer le curseur vers la gauche (non implémenté ici)
        break;

      case 'ArrowRight':
        // Déplacer le curseur vers la droite (non implémenté ici)
        break;

      case 'ArrowUp':
        setHistoryIndex(prev => {
          const newIndex = Math.min(prev + 1, commandHistory.length - 1);
          setInputMessage(commandHistory[newIndex] || '');
          return newIndex;
        });
        break;

      case 'ArrowDown':
        setHistoryIndex(prev => {
          const newIndex = Math.max(prev - 1, -1);
          setInputMessage(newIndex === -1 ? '' : commandHistory[newIndex]);
          return newIndex;
        });
        break;

      default:
        if (e.key.length === 1) { // Vérifie si c'est un caractère imprimable
          setInputMessage(prev => prev + e.key);
        }
        break;
    }
  };

  const handleMistralInteraction = async (userInput) => {
    try {
        // Ajouter le message de l'utilisateur comme message distinct
        addMessage('user', `> ${userInput}`, false);
        
        // Créer un nouveau message vide pour la réponse de l'assistant
        addMessage('assistant', '', false);
        let currentMessage = '';
        
        const response = await fetch(`${API_URL}/api/mistral/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: userInput,
                language: language
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.content) {
                            currentMessage += data.content;
                            // Mettre à jour uniquement le dernier message (réponse de l'assistant)
                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1] = {
                                    type: 'assistant',
                                    content: currentMessage
                                };
                                return newMessages;
                            });
                        }
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'interaction avec Mistral AI:', error);
        addMessage('error', 'Erreur lors de la communication avec l\'assistant Mistral AI.');
    }
  };

  function reorganizePersonalInfo(data) {
    const topInfo = {
      title: data.title,
      wanted_position: data.wanted_position,
      phone: data.phone,
      name: data.name,
      summary: data.summary,

    };
  
    const bottomInfo = { ...data };
    delete bottomInfo.name;
    delete bottomInfo.title;
    delete bottomInfo.wanted_position;
    delete bottomInfo.phone;
    delete bottomInfo.summary;
    delete bottomInfo.language;
  
    return { ...bottomInfo, ...topInfo };
  }

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.focus();
    }
  }, []);

  if (isLoading) return <div className="h-full bg-[var(--bg-primary)] text-[var(--accent-color)] p-4">{t('loading')}</div>;
  if (error) return <div className="h-full bg-[var(--bg-primary)] text-red-500 p-4">{error}</div>;
  if (!personalInfo) return <div className="h-full bg-[var(--bg-primary)] text-yellow-500 p-4">{t('connectionError')}</div>;

  return (
    <div className="h-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      <div className="bg-[var(--bg-secondary)] px-4 py-2 text-xs font-bold uppercase tracking-wide flex justify-between items-center">
        <span>{t('terminal')}</span>
        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">_</button>
      </div>
      <div 
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-4 focus:outline-none" 
        tabIndex="0"
        onKeyDown={handleKeyDown}
      >
        {messages.map((message, index) => (
          <div key={index} className="mb-2 text-xs font-mono whitespace-pre-wrap flex items-center">
            {message.type === 'command' && (
              <span className={`w-2 h-2 rounded-full mr-2 ${message.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            )}
            <span>{message.content}</span>
          </div>
        ))}
        <div className="text-xs font-mono">
          {isTalkWithMeRunning ? '> ' : `${personalInfo.name.toLowerCase().replace(' ', '')}@cv-server ${currentDirectory} % `}
          {inputMessage}
          <span className="animate-blink">|</span>
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Console;
