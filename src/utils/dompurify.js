// src/utils/dompurify.js
const createDOMPurify = () => {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  const escapeHTML = (str) => {
    return String(str).replace(/[&<>"'`=/]/g, (s) => escapeMap[s]);
  };

  const isValidProtocol = (url) => {
    const validProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    const urlObj = new URL(url.startsWith('//') ? `https:${url}` : url);
    return validProtocols.includes(urlObj.protocol);
  };

  const sanitizeHTML = (dirty) => {
    if (typeof dirty !== 'string') return '';
    return escapeHTML(dirty);
  };

  const sanitizeURL = (dirty) => {
    if (typeof dirty !== 'string') return '';
    try {
      if (dirty.startsWith('data:')) return '';
      if (!isValidProtocol(dirty)) return '';
      return dirty;
    } catch {
      return '';
    }
  };

  return { sanitizeHTML, sanitizeURL };
};

const DOMPurify = createDOMPurify();
export default DOMPurify;