import vi from '../locales/vi.json';

/**
 * Get localized string by path with optional parameter interpolation
 * Example: t('common.save')
 * Example: t('toast.delete_success_message', { item: 'LSX-001' })
 *
 * @param {string} keyPath - Dot-separated path in vi.json (e.g. 'common.save')
 * @param {object|string} [params] - Replacement parameters or fallback string
 * @param {string} [fallback] - Fallback string if key not found
 * @returns {string} Localized text
 */
export function t(keyPath, params = {}, fallback = '') {
  if (!keyPath) return '';

  const actualFallback = typeof params === 'string' ? params : fallback || keyPath;
  const actualParams = typeof params === 'object' && params !== null ? params : {};

  const keys = keyPath.split('.');
  let current = vi;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return actualFallback;
    }
  }

  if (typeof current !== 'string') {
    return actualFallback;
  }

  // Parameter replacement: {paramName}
  let result = current;
  for (const [paramKey, paramValue] of Object.entries(actualParams)) {
    result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
  }

  return result;
}

export function useI18n() {
  return { t, locale: 'vi' };
}

export default t;
