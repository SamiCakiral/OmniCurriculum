export let API_URL = 'http://localhost:8000';

export const initializeConfig = async () => {
  try {
    const response = await fetch('/api/get-api-url');
    const data = await response.json();
    API_URL = data.apiUrl;
    console.log('API_URL initialized:', API_URL);
  } catch (error) {
    console.error('Failed to fetch API URL:', error);
  }
};

export const getApiUrl = () => API_URL;
