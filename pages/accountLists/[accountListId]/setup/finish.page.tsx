import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Button } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { SetupPage } from 'src/components/Setup/SetupPage';
import { LargeButton } from 'src/components/Setup/styledComponents';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUpdateSetupPositionMutation } from './Finish.generated';

// This is the last page of the tour, and it lets users choose to go to the
// tools page. It is always shown.
const FinishPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const accountListId = useAccountListId();
  const { push } = useRouter();
  const [updateSetupPosition] = useUpdateSetupPositionMutation();

  const setSetupPosition = (setupPosition: string) =>
    updateSetupPosition({
      variables: {
        setupPosition,
      },
    });

  useEffect(() => {
    setSetupPosition('finish');
  }, []);

  const handleNext = async () => {
    await setSetupPosition('');
    push(`/accountLists/${accountListId}/tools?setup=1`);
  };

  const handleFinish = async () => {
    await setSetupPosition('');
    push(`/accountLists/${accountListId}`);
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Setup - Finish')}
        </title>
      </Head>
      <SetupPage
        title={
          <Trans>
            Congratulations!
            <br />
            You&apos;re all set!
          </Trans>
        }
      >
        <p>
          {t(
            `One of the great features of {{appName}} is its ability to bring in information and contacts from other places you might have used in the past.
You can import from software like TntConnect, Google Contacts or a Spreadsheet.`,
            { appName },
          )}
        </p>
        <p>
          {t(
            "Would you like to import that data now? (Current users don't need to reimport their data)",
          )}
        </p>
        <LargeButton variant="contained" fullWidth onClick={handleNext}>
          {t('Yes! Import my stuff!')}
        </LargeButton>
        <Button fullWidth onClick={handleFinish}>
          {t("Nope, I'm all done! Take me to {{appName}}", { appName })}
        </Button>
      </SetupPage>
    </>
  );
};

export const getServerSideProps = loadSession;

export default FinishPage;
