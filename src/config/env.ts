// Environment configuration for OttEHR
// All values pulled from VITE_* variables

export const config = {
  AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN!,
  AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID!,
  AUTH0_REDIRECT_URI: import.meta.env.VITE_AUTH0_REDIRECT_URI!,
  AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE!,
  PROJECT_ID: import.meta.env.PROJECT_ID!,
  FHIR_API_URL: import.meta.env.VITE_FHIR_API_URL || 'https://fhir-api.zapehr.com',
  PROJECT_API_URL: import.meta.env.VITE_PROJECT_API_URL || 'https://project-api.zapehr.com/v1'
}

export default config
