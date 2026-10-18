export function parseOptionalEnv(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseRequiredEnv(name: string, value: unknown): string {
  const parsed = parseOptionalEnv(value);
  if (!parsed) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return parsed;
}

export const API_URL: string = parseRequiredEnv(
  'VITE_API_URL',
  import.meta.env.VITE_API_URL
);
export const GOOGLE_CLIENT_ID: string | undefined = parseOptionalEnv(
  import.meta.env.VITE_GOOGLE_CLIENT_ID
);
export const GITHUB_CLIENT_ID: string | undefined = parseOptionalEnv(
  import.meta.env.VITE_GITHUB_CLIENT_ID
);
export const IS_DEV = Boolean(import.meta.env.DEV);
