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
  const [commandHistory, setCommandHistory] = useState([
    'python talkWithMe_stral.py',
    'cat personalInfo.json',
    `ssh ${personalInfo?.name.toLowerCase().replace(' ', '')}@cv-server`
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMistralInitialized, setIsMistralInitialized] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const translations = {
    fr: {
      loading: "Chargement du terminal...",
      connectionError: "Impossible de se connecter au serveur CV.",
      terminal: "Terminal",
      welcomeMessage: "Bienvenue ! Je suis {name}, enfin une version artificielle de moi-même (propulsé par Mixtral 8x22B). Posez moi des questions sur moi je serait ravi de répondre ! (tapez 'exit' pour quitter)",
      foundSecretFile: "Merci d'avoir trouvé ce fichier j'ai pas codé ça pour rien hahaha",
      assistantStopped: "Assistant virtuel arrêté.",
      noProgramToQuit: "Aucun programme à quitter.",
      unknownCommand: "Commande non reconnue : {command}",
      cdError: "cd: {dir}: Aucun fichier ou dossier de ce type",
      emptyDirectory: "Dossier vide"
    },
    en: {
      loading: "Loading terminal...",
      connectionError: "Unable to connect to CV server.",
      terminal: "Terminal",
      welcomeMessage: "Welcome! I'm {name}, well actually I am a virtual version of myself (powered by Mixtral 8x22B). Ask me questions about me and I'll be happy to answer! (type 'exit' to quit)",
      foundSecretFile: "Thanks for finding this file I didn't code this for nothing hahaha",
      assistantStopped: "Virtual assistant stopped.",
      noProgramToQuit: "No program to quit.",
      unknownCommand: "Unknown command: {command}",
      cdError: "cd: {dir}: No such file or directory",
      emptyDirectory: "Directory is empty"
    }
  };
  const t = (key, params = {}) => {
    let translation = translations[language][key] || key;
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    return translation;
  };
  // Initialisons une structure de base pour le système de fichiers
  const [fileSystem, setFileSystem] = useState({
    '~': {
      'projects': {
        type: 'directory',
        content: {
          'project1.txt': {
            type: 'file',
            content: 'Description du projet 1'
          }
        }
      },
      'education': {
        type: 'directory',
        content: {
          'education1.txt': {
            type: 'file',
            content: 'Description de l\'éducation 1'
          }
        }
      },
      'experience': {
        type: 'directory',
        content: {
          'experience1.txt': {
            type: 'file',
            content: 'Description de l\'expérience 1'
          }
        }
      },
      'skills': {
        type: 'directory',
        content: {
          'skills1.txt': {
            type: 'file',
            content: 'Description des compétences 1'
          }
        }
      },
      'personalInfo.json': {
        type: 'file',
        content: ''
      },
      '.talkWithMe_stral.py': {  // Notez le point au début pour le cacher
        type: 'file',
        content: '# Hidden AI Chat Interface'
      },
      '.trouve.txt': {  // Ajout du point pour le cacher
        type: 'file',
        content: t('foundSecretFile')
      }
    }
  });

  



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
            { type: 'command', content: `${response.data[0].name.toLowerCase().replace(' ', '')}@cv-server ~ % python talkWithMe_stral.py`, status: 'success' },
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

    // Ajout du message de commande
    addMessage('command', `${personalInfo.name.toLowerCase().replace(' ', '')}@cv-server ${currentDirectory} % ${command}`, 'success');

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
        if (args[0] === 'talkWithMistral.py' || args[0] === '.talkWithMe.py') {
          setIsTalkWithMeRunning(true);
          addMessage('output', t('welcomeMessage', { name: personalInfo.name }));
        } else {
          addMessage('output', `Fichier Python non trouvé : ${args[0]}`);
        }
        break;
      case 'exit':
        if (isTalkWithMeRunning) {
          setIsTalkWithMeRunning(false);
          addMessage('output', t('assistantStopped'));
          // Réinitialiser le répertoire courant à la racine
          setCurrentDirectory('~');
        } else {
          addMessage('output', t('noProgramToQuit'));
        }
        break;
      default:
        addMessage('output', t('unknownCommand', { command: cmd }));
    }
  };

  const handleCd = (dir) => {
    if (!dir || dir === '~') {
      setCurrentDirectory('~');
      addMessage('output', '');
      return;
    }

    if (dir === '..') {
      if (currentDirectory !== '~') {
        const newPath = currentDirectory.split('/').slice(0, -1).join('/') || '~';
        setCurrentDirectory(newPath);
        addMessage('output', '');
      }
      return;
    }

    let current = fileSystem['~'];
    if (dir in current && current[dir].type === 'directory') {
      setCurrentDirectory(currentDirectory === '~' ? `~/${dir}` : `${currentDirectory}/${dir}`);
      addMessage('output', '');
    } else {
      addMessage('output', t('cdError', { dir: dir }));
    }
  };

  const handleLs = (showHidden = false) => {
    let current = fileSystem['~'];
    
    // Navigation vers le bon répertoire
    if (currentDirectory !== '~') {
      const pathParts = currentDirectory.split('/').filter(part => part !== '~');
      for (const part of pathParts) {
        if (current[part] && current[part].type === 'directory') {
          current = current[part].content;
        }
      }
    }

    // Filtrer et formater les éléments
    const items = Object.entries(current)
      .filter(([name]) => showHidden || !name.startsWith('.'))
      .map(([name, item]) => {
        if (item.type === 'directory') {
          return name + '/';  // Ajouter un slash pour les dossiers
        }
        return name;
      });

    if (items.length === 0) {
      addMessage('output', t('emptyDirectory'));
    } else {
      // Créer une chaîne simple avec les éléments
      const output = items.join('  ');
      addMessage('output', output);
    }
  };

  const handleEcho = (text) => {
    addMessage('output', text);
  };

  const handleCat = (file) => {
    let current = fileSystem['~'];
    
    // Si nous ne sommes pas à la racine, naviguer jusqu'au bon répertoire
    if (currentDirectory !== '~') {
      const pathParts = currentDirectory.split('/').filter(part => part !== '~');
      for (const part of pathParts) {
        if (current[part] && current[part].type === 'directory') {
          current = current[part].content;
        }
      }
    }

    if (current[file] && current[file].type === 'file') {
      if (file === 'personalInfo.json' && personalInfo) {
        const formattedInfo = reorganizePersonalInfo(personalInfo);
        addMessage('output', JSON.stringify(formattedInfo, null, 2));
      } else {
        addMessage('output', current[file].content);
      }
    } else {
      addMessage('output', t('catError', { file: file }));
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

        // Modifions cette partie pour éviter les doublons dans l'historique
        setCommandHistory(prev => {
          // Vérifie si la commande existe déjà dans l'historique
          if (!prev.includes(inputMessage)) {
            return [inputMessage, ...prev];
          }
          return prev;
        });
        setHistoryIndex(-1);

        if (isTalkWithMeRunning) {
          if (inputMessage.toLowerCase() === 'exit') {
            setIsTalkWithMeRunning(false);
            addMessage('command', '> exit');
            addMessage('output', t('assistantStopped'));
          } else {
            handleMistralInteraction(inputMessage);
          }
        } else {
          addMessage('command', `${personalInfo.name.toLowerCase().replace(' ', '')}@cv-server ${currentDirectory} % ${inputMessage}`);
          handleCommand(inputMessage);
        }

        setInputMessage('');
        setCursorPosition(0); // Réinitialiser la position du curseur après Enter
        break;

      case 'Backspace':
        if (cursorPosition > 0) {
          setInputMessage(prev => 
            prev.slice(0, cursorPosition - 1) + prev.slice(cursorPosition)
          );
          setCursorPosition(prev => Math.max(0, prev - 1));
        }
        break;

      case 'ArrowLeft':
        setCursorPosition(prev => Math.max(0, prev - 1));
        break;

      case 'ArrowRight':
        setCursorPosition(prev => Math.min(inputMessage.length, prev + 1));
        break;

      case 'ArrowUp':
        setHistoryIndex(prev => {
          const newIndex = Math.min(prev + 1, commandHistory.length - 1);
          setInputMessage(commandHistory[newIndex] || '');
          return newIndex;
        });
        if (commandHistory[historyIndex + 1]) {
          setCursorPosition(commandHistory[historyIndex + 1].length);
        }
        break;

      case 'ArrowDown':
        setHistoryIndex(prev => {
          const newIndex = Math.max(prev - 1, -1);
          setInputMessage(newIndex === -1 ? '' : commandHistory[newIndex]);
          return newIndex;
        });
        if (historyIndex === -1) {
          setCursorPosition(0);
        } else if (commandHistory[historyIndex - 1]) {
          setCursorPosition(commandHistory[historyIndex - 1].length);
        }
        break;

      default:
        if (e.key.length === 1) { // Caractère imprimable
          setInputMessage(prev => 
            prev.slice(0, cursorPosition) + e.key + prev.slice(cursorPosition)
          );
          setCursorPosition(prev => prev + 1);
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

  // Ajout d'un useEffect pour initialiser le système de fichiers avec les données personnelles
  useEffect(() => {
    if (personalInfo) {
      setFileSystem(prev => ({
        ...prev,
        '~': {
          ...prev['~'],
          'personalInfo.json': {
            type: 'file',
            content: JSON.stringify(reorganizePersonalInfo(personalInfo), null, 2)
          },
          '.talkWithMe_stral.py': {  // Correction du nom du fichier
            type: 'file',
            content: '# Hidden AI Chat Interface'
          },
          '.trouve.txt': {  // Fichier caché
            type: 'file',
            content: t('foundSecretFile')
          }
        }
      }));
    }
  }, [personalInfo, language]);

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
            <span>
              {message.content.split('  ').map((item, i) => (
                <span
                  key={i}
                  className={`${item.endsWith('/') ? 'text-blue-500' : ''}`}
                  style={{ marginRight: i < message.content.split('  ').length - 1 ? '1rem' : 0 }}
                >
                  {item}
                </span>
              ))}
            </span>
          </div>
        ))}
        <div className="text-xs font-mono">
          {isTalkWithMeRunning ? '> ' : `${personalInfo.name.toLowerCase().replace(' ', '')}@cv-server ${currentDirectory} % `}
          <span>{inputMessage.slice(0, cursorPosition)}</span>
          <span className="animate-blink">|</span>
          <span>{inputMessage.slice(cursorPosition)}</span>
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Console;
