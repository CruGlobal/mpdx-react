import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Return an object where the keys are email address locations and the values are the localized labels
export const useEmailLocations = (): Record<string, string> => {
  const { t } = useTranslation();

  const locations = useMemo(
    () => ({
      work: t('Work'),
      personal: t('Personal'),
      other: t('Other'),
    }),
    [t],
  );

  return locations;
};
