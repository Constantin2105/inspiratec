import { useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

const parseWithDate = (jsonString) => {
  const reviver = (key, value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return value;
  };
  try {
    return JSON.parse(jsonString, reviver);
  } catch (e) {
    console.error("Failed to parse JSON from session storage", e);
    return null;
  }
};

export const useFormPersistence = (form, storageKey, options = {}) => {
  const { watch, reset, formState: { isDirty }, getValues } = form;
  const { exclude = [] } = options;

  const watchedValues = watch();
  const debouncedValues = useDebounce(watchedValues, 500);
  const formRef = useRef(form);
  formRef.current = form;

  const saveData = useCallback(() => {
    if (!storageKey) return;
    
    const currentForm = formRef.current;
    if (!currentForm || !currentForm.formState.isDirty) {
      return;
    }

    const values = currentForm.getValues();
    const dataToSave = {};

    for (const key in values) {
      if (!exclude.includes(key)) {
        dataToSave[key] = values[key];
      }
    }
    
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save form data to session storage", error);
    }
  }, [storageKey, exclude]);
  
  useEffect(() => {
    if (!storageKey) return;
    try {
      const savedDataString = sessionStorage.getItem(storageKey);
      if (savedDataString) {
        const savedData = parseWithDate(savedDataString);
        
        if(savedData) {
          const restoredData = { ...savedData };
          Object.keys(restoredData).forEach(key => {
              const value = restoredData[key];
              if (value instanceof FileList || value instanceof File || (typeof value === 'object' && value !== null && 'name' in value && 'size' in value)) {
                  delete restoredData[key];
              }
          });

          reset(restoredData, { keepDefaultValues: true });
        }
      }
    } catch (error) {
      console.error("Failed to load form data from session storage", error);
    }
  }, [storageKey, reset]);

  useEffect(() => {
    if (isDirty) {
      saveData();
    }
  }, [debouncedValues, isDirty, saveData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveData();
      }
    };

    const handleBeforeUnload = (e) => {
      if (formRef.current?.formState.isDirty) {
        saveData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveData]);
};

export const clearFormPersistence = (storageKey) => {
  if (!storageKey) return;
  try {
    sessionStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear form data from session storage", error);
  }
};