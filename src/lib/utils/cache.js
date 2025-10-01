import React from 'react';

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const getFromCache = (key) => {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    const { timestamp, data } = JSON.parse(cached);

    if (Date.now() - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (error) {
    return null;
  }
};

export const setInCache = (key, data) => {
  try {
    const item = {
      timestamp: Date.now(),
      data,
    };
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    // Cache is full or other issue, fail silently
  }
};