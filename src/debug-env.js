// Debug script to check environment variables
console.log('Environment Variables Debug:');
console.log('REACT_APP_GEMINI_API_KEY:', process.env.REACT_APP_GEMINI_API_KEY ? 'SET' : 'NOT SET');
console.log('REACT_APP_GEMINI_API_KEY length:', process.env.REACT_APP_GEMINI_API_KEY?.length || 0);
console.log('REACT_APP_DEFAULT_MODEL:', process.env.REACT_APP_DEFAULT_MODEL);
console.log('NODE_ENV:', process.env.NODE_ENV);

export default function debugEnv() {
  return {
    apiKeySet: !!process.env.REACT_APP_GEMINI_API_KEY,
    apiKeyLength: process.env.REACT_APP_GEMINI_API_KEY?.length || 0,
    defaultModel: process.env.REACT_APP_DEFAULT_MODEL,
    nodeEnv: process.env.NODE_ENV
  };
}
