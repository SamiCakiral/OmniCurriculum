export function detectLanguage() {
    const navigatorLanguage = navigator.language || navigator.userLanguage;
    const languageCode = navigatorLanguage.split('-')[0]; // Prend seulement la partie principale du code de langue
  
    // Liste des langues supportées par votre application
    const supportedLanguages = ['fr', 'en'];
  
    // Vérifie si la langue détectée est supportée, sinon utilise l'anglais par défaut
    return supportedLanguages.includes(languageCode) ? languageCode : 'en';
  }