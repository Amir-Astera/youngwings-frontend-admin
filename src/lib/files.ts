import { API_BASE_URL } from './config';

const isAbsoluteUrl = (value: string) => /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('data:');

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const FILES_PREFIX = '/api/files/';
const THUMBNAIL_PREFIX = '/api/files/thumbnail/';

const ensureAssetsSegmentUppercase = (path: string): string => {
  if (!path) {
    return path;
  }

  return path.replace(
    /(\/?api\/files(?:\/thumbnail)?\/)(assets)(?=\/)/gi,
    (_match, prefix: string) => `${prefix}ASSETS`
  );
};
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch (error) {
    return undefined;
  }
})();

const normalizeFilePath = (value: string): string => {
  if (!value || value.startsWith('data:')) {
    return value;
  }

  const insertThumbnailSegment = (path: string): string => {
    if (!path) {
      return path;
    }

    if (path.startsWith(THUMBNAIL_PREFIX)) {
      return ensureAssetsSegmentUppercase(path);
    }

    if (path.startsWith(FILES_PREFIX)) {
      return ensureAssetsSegmentUppercase(path.replace(FILES_PREFIX, THUMBNAIL_PREFIX));
    }

    const trimmedPath = path.replace(/^\/+/, '');

    if (trimmedPath.startsWith('api/files/thumbnail/')) {
      return ensureAssetsSegmentUppercase(ensureLeadingSlash(trimmedPath));
    }

    if (trimmedPath.startsWith('api/files/')) {
      return ensureAssetsSegmentUppercase(
        ensureLeadingSlash(
          trimmedPath.replace('api/files/', 'api/files/thumbnail/')
        )
      );
    }

    const looksLikeFilePath = /\.[^./]+$/.test(trimmedPath);

    if (looksLikeFilePath && !trimmedPath.startsWith('api/')) {
      return ensureAssetsSegmentUppercase(`${THUMBNAIL_PREFIX}${trimmedPath}`);
    }

    return ensureAssetsSegmentUppercase(path);
  };

  if (isAbsoluteUrl(value)) {
    try {
      const url = new URL(value);

      if (!API_ORIGIN || url.origin === API_ORIGIN) {
        const normalizedPath = insertThumbnailSegment(url.pathname || '/');

        if (normalizedPath !== url.pathname) {
          url.pathname = normalizedPath;
          return url.toString();
        }
      } else if (
        url.pathname.startsWith(FILES_PREFIX) &&
        !url.pathname.startsWith(THUMBNAIL_PREFIX)
      ) {
        url.pathname = ensureAssetsSegmentUppercase(
          url.pathname.replace(FILES_PREFIX, THUMBNAIL_PREFIX)
        );
        return url.toString();
      }

      return ensureAssetsSegmentUppercase(value);
    } catch (error) {
      return ensureAssetsSegmentUppercase(value);
    }
  }

  if (value.includes(FILES_PREFIX) && !value.includes(THUMBNAIL_PREFIX)) {
    return ensureAssetsSegmentUppercase(
      value.replace(FILES_PREFIX, THUMBNAIL_PREFIX)
    );
  }

  return insertThumbnailSegment(value);
};

export const resolveFileUrl = (input?: string | null): string | undefined => {
  if (typeof input !== 'string') {
    return undefined;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return undefined;
  }

  const normalized = normalizeFilePath(trimmed);

  if (isAbsoluteUrl(normalized)) {
    return normalized;
  }

  try {
    return new URL(normalized, API_BASE_URL).href;
  } catch (error) {
    return `${API_BASE_URL}${ensureLeadingSlash(normalized)}`;
  }
};
