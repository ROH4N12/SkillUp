import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/api';

export function useFetch(url, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(initialData === null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (options = {}) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent && data === null) {
      setLoading(true);
    } else {
      setIsRefetching(true);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl(url), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      setData(json);
      setError(null);
      return json;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, [url, data]);

  useEffect(() => {
    fetchData();
  }, [url]);

  // Optimistic UI updater
  const mutate = useCallback((updater) => {
    setData((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  return { data, setData, loading, isRefetching, error, refetch: fetchData, mutate };
}


export const apiCall = async (url, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(getApiUrl(url), options);
  if (!res.ok) throw new Error('API call failed');
  return res.json();
};
