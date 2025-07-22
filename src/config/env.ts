
// Environment configuration for OttEHR
// These are client-side safe variables that can be committed to the repository

export const config = {
  // Auth0 Configuration
  AUTH0_DOMAIN: 'https://auth.zapehr.com',
  AUTH0_CLIENT_ID: 'o3rszl2nKI6I1aH6sbl8dFrFgMVG2iMc',
  AUTH0_REDIRECT_URI: 'https://valorwell.lovable.app/callback',
  AUTH0_AUDIENCE: 'https://api.zapehr.com',
  
  // Project Configuration
  PROJECT_ID: 'c9096a35-8f38-43fe-bc68-63558cfdc2c5',
  
  // Application URLs (can be overridden for different environments)
  FHIR_API_URL: 'https://fhir-api.zapehr.com',
  PROJECT_API_URL: 'https://project-api.zapehr.com/v1',
};

// Helper function to get config values with fallback to import.meta.env
export const getConfig = (key: keyof typeof config): string => {
  // First try the direct config
  const directValue = config[key];
  if (directValue) return directValue;
  
  // Fallback to environment variables if available
  const envKey = `VITE_${key}` as keyof ImportMetaEnv;
  return (import.meta.env[envKey] as string) || '';
};

export default config;
