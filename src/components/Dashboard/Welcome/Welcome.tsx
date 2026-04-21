import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useGreeting } from 'src/hooks/useGreeting';
import { getAppName } from 'src/lib/getAppName';
import PageHeading from '../../PageHeading';

interface Props {
  firstName?: string;
}

const Welcome = ({ firstName }: Props): ReactElement => {
  const { t } = useTranslation();
  const greeting = useGreeting(firstName);
  const appName = getAppName();

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
