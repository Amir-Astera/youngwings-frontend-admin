import { API_BASE_URL } from './config';

const isAbsoluteUrl = (value: string) => /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('data:');

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

export const resolveFileUrl = (input?: string | null): string | undefined => {
  if (typeof input !== 'string') {
    return undefined;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return undefined;
  }

  if (isAbsoluteUrl(trimmed)) {
    return trimmed;
  }

  try {
    return new URL(trimmed, API_BASE_URL).href;
  } catch (error) {
    return `${API_BASE_URL}${ensureLeadingSlash(trimmed)}`;
  }
};
