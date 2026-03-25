import { useState, useEffect } from 'react';
import { fetchQuickLinks } from '../lib/googleSheets';

export function useQuickLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchQuickLinks();
      setLinks(data);
      setLoading(false);
    };

    load();
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { links, loading };
}
