import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeading from '../../PageHeading';
import illustration9 from '../../../images/drawkit/grape/drawkit-grape-pack-illustration-9.svg';

interface Props {
  firstName?: string;
}

const Welcome = ({ firstName }: Props): ReactElement => {
  const { t } = useTranslation();
  const today = new Date();
  const currentHour = today.getHours();

  let greeting = firstName
    ? t('Good Evening, {{ firstName }}.', { firstName })
    : t('Good Evening,');

  if (currentHour < 12) {
    greeting = firstName
      ? t('Good Morning, {{ firstName }}.', { firstName })
      : t('Good Morning,');
  } else if (currentHour < 18) {
    greeting = firstName
      ? t('Good Afternoon, {{ firstName }}.', { firstName })
      : t('Good Afternoon,');
  }

  return (
    <PageHeading
      heading={greeting}
      subheading={t("Welcome back to MPDX. Here's what's been happening.")}
      imgSrc={illustration9}
    />
  );
};

export default Welcome;
