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
  const [localeStorageLanguage, setLocaleStorageLanguage] = useLocalStorage(
    `user-language`,
    '',
  );
  useEffect(() => {
    // if the language in locale storage is different than the saved language, the user may have changed languages in a different browser. If so, refetch the constants.
    if (localeStorageLanguage !== userSavedLanguage) {
      setLocaleStorageLanguage(userSavedLanguage || '');
      refetch();
    }
  }, [userSavedLanguage]);

  return data?.constant;
};
