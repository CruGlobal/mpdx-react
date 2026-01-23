import { useCallback, useState } from 'react';

export const useTrackMutation = () => {
  const [mutationCount, setMutationCount] = useState(0);

  const trackMutation = useCallback(
    async <T>(mutation: Promise<T>): Promise<T> => {
      setMutationCount((prev) => prev + 1);
      return mutation.finally(() => {
        setMutationCount((prev) => Math.max(0, prev - 1));
      });
    },
    [],
  );

  return { trackMutation, isMutating: mutationCount > 0 };
};
