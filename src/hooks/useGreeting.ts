import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

export const useGreeting = (name?: string): string => {
  const { t } = useTranslation();
  const today = DateTime.local();
  const currentHour = today.hour;

  let greeting = t('Good Evening,');

  if (currentHour < 12) {
    greeting = t('Good Morning,');
  } else if (currentHour < 18) {
    greeting = t('Good Afternoon,');
  }
  if (name) {
    greeting += ` ${name}.`;
  }
  return greeting;
};
