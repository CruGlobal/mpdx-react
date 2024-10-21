import { useEffect } from 'react';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import {
  LoadConstantsQuery,
  useLoadConstantsQuery,
} from './LoadConstants.generated';

// Use this call to force loading from cache storage first
export const useApiConstants = ():
  | LoadConstantsQuery['constant']
  | undefined => {
  const { data, refetch } = useLoadConstantsQuery({
    fetchPolicy: 'cache-first',
  });

  const userSavedLanguage = data?.user.preferences?.locale;
  const [localStorageLanguage, setLocalStorageLanguage] = useLocalStorage(
    `constants-language`,
    '',
  );
  useEffect(() => {
    // if the language in local storage is different than the saved language, that may mean the cached constants are in the previous language. If so, refetch the constants.

    if (userSavedLanguage && localStorageLanguage !== userSavedLanguage) {
      setLocalStorageLanguage(userSavedLanguage || '');
      refetch();
    }
  }, [userSavedLanguage]);

  return data?.constant;
};
