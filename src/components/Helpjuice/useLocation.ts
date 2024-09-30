import { useEffect, useState } from 'react';

// This hook returns the current value of location.href
export const useLocation = () => {
  const [href, setHref] = useState(
    typeof location !== 'undefined' ? location.href : '',
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setHref(location.href);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  return href;
};
