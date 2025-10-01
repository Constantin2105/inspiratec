import React from 'react';

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export const htmlToPlainText = (htmlString, maxLength = 150) => {
  if (!htmlString) return '';
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  let text = div.textContent || div.innerText || '';
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

export const getInitials = (displayName) => {
  if (!displayName || typeof displayName !== 'string') {
    return '??';
  }
  const parts = displayName.split(' ').filter(Boolean); // Split by space and remove empty strings
  if (parts.length === 0) {
    return '??';
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};