import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import illustration9 from '../../../images/drawkit/grape/drawkit-grape-pack-illustration-9.svg';
import PageHeading from '../../PageHeading';

interface Props {
  firstName?: string;
}

const Welcome = ({ firstName }: Props): ReactElement => {
  const { t } = useTranslation();
  const today = DateTime.local();
  const { appName } = useGetAppSettings();
  const currentHour = today.hour;

  let greeting = t('Good Evening,') + (firstName ? ` ${firstName}.` : '');

  if (currentHour < 12) {
    greeting = t('Good Morning,') + (firstName ? ` ${firstName}.` : '');
  } else if (currentHour < 18) {
    greeting = t('Good Afternoon,') + (firstName ? ` ${firstName}.` : '');
  }

  return (
    <PageHeading
      heading={greeting}
      subheading={t(
        "Welcome back to {{appName}}. Here's what's been happening.",
        { appName },
      )}
      imgSrc={illustration9}
      height={180}
    />
  );
};

export default Welcome;
