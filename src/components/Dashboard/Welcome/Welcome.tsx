import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import PageHeading from '../../PageHeading';

interface Props {
  firstName?: string;
}

const Welcome = ({ firstName }: Props): ReactElement => {
  const { t } = useTranslation();
  const today = DateTime.local();
  const { appName } = useGetAppSettings();
  const currentHour = today.hour;

  let greeting = t('Good Evening,');

  if (currentHour < 12) {
    greeting = t('Good Morning,');
  } else if (currentHour < 18) {
    greeting = t('Good Afternoon,');
  }
  if (firstName) {
    greeting += ` ${firstName}.`;
  }

  return (
    <PageHeading
      heading={greeting}
      subheading={t(
        "Welcome back to {{appName}}. Here's what's been happening.",
        { appName },
      )}
      image={false}
      height={105}
    />
  );
};

export default Welcome;
