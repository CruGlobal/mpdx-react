import Head from 'next/head';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdatePersonalPreferencesMutation } from 'src/components/Settings/preferences/accordions/UpdatePersonalPreferences.generated';
import { SetupPage } from 'src/components/Setup/SetupPage';
import { LargeButton } from 'src/components/Setup/styledComponents';
import { useNextSetupPage } from 'src/components/Setup/useNextSetupPage';
import {
  PrivacyPolicyLink,
  TermsOfUseLink,
} from 'src/components/Shared/Links/Links';
import { LanguageAutocomplete } from 'src/components/common/Autocomplete/LanguageAutocomplete/LanguageAutocomplete';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { ensureSessionAndAccountList } from '../api/utils/pagePropsHelpers';

// This is the first page of the tour, and it lets users choose their language. It is always shown.
const StartPage = (): ReactElement => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { next } = useNextSetupPage();
  const [savePreferences] = useUpdatePersonalPreferencesMutation();

  const [locale, setLocale] = useState<string | null | undefined>(
    (typeof window === 'undefined'
      ? null
      : window.navigator.language.toLowerCase()) || 'en-us',
  );

  const handleSave = async () => {
    await savePreferences({
      variables: {
        input: {
          attributes: {
            locale,
          },
        },
      },
    });
    await next();
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Setup - Start')}`}</title>
      </Head>
      <SetupPage title={t("It's time to get started")}>
        <p>
          {t(
            `Developing a healthy team of ministry partners sets your ministry up to thrive.
{{appName}} is designed to help you do the right things, with the right people at the right time to be fully funded.`,
            { appName },
          )}
        </p>
        <p>
          {t(
            `To get started, we're going to walk with you through a few key steps to set you up for success in {{appName}}!`,
            { appName },
          )}
        </p>
        <p>{t('It looks like you speak')}</p>
        <LanguageAutocomplete
          disableClearable
          value={locale}
          onChange={(_, value) => {
            setLocale(value);
          }}
          TextFieldProps={{
            label: t('Language'),
          }}
        />
        <p>
          {t('By Clicking "Let\'s Begin!" you have read and agree to the ')}
          <PrivacyPolicyLink />
          {t(' and the ')}
          <TermsOfUseLink />
        </p>
        <LargeButton variant="contained" fullWidth onClick={handleSave}>
          {t("Let's Begin")}
        </LargeButton>
      </SetupPage>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default StartPage;
