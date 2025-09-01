import { useState, useCallback } from 'react';
import { bingoApi } from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.response?.data?.detail || 'Error de conexión');
      setLoading(false);
      throw err;
    }
  }, []);

  return { callApi, loading, error };
};