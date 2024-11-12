import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Return an object where the keys are phone number locations and the values are the localized labels
export const usePhoneLocations = (): Record<string, string> => {
  const { t } = useTranslation();

  const locations = useMemo(
    () => ({
      mobile: t('Mobile'),
      home: t('Home'),
      work: t('Work'),
      other: t('Other'),
    }),
    [t],
  );

  return locations;
};
