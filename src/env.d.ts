
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Core Authentication Variables
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_REDIRECT_URI: string;
  readonly PROJECT_ID: string;

  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_IS_LOCAL: string;
  readonly VITE_APP_ENVIRONMENT: string;

  // OystEHR API Configuration
  readonly VITE_APP_FHIR_API_URL: string;
  readonly VITE_APP_PROJECT_API_URL: string;
  readonly VITE_APP_OYSTEHR_APPLICATION_AUDIENCE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
