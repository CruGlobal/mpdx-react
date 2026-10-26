import { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';

// Refetches the queries on the page whose last request never reached the
// server, so data that failed to load while offline loads once the connection
// comes back
export const RefetchOnReconnect: React.FC = () => {
  const client = useApolloClient();

  useEffect(() => {
    const handleOnline = () => {
      client.getObservableQueries('active').forEach((query) => {
        const networkError = query.getCurrentResult().error?.networkError;
        // A server error has a status code. Only a request with no response
        // at all failed because the user was offline.
        if (networkError && !('statusCode' in networkError)) {
          // The error link already reports a failed refetch
          query.refetch().catch(() => {});
        }
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [client]);

  return null;
};
