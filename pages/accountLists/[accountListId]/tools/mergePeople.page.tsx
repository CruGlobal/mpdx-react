import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import Loading from '../../../../src/components/Loading';
import MergePeople from '../../../../src/components/Tool/MergePeople/MergePeople';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const MergePeoplePage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Merge People')}
        </title>
      </Head>
      {accountListId ? (
        <MergePeople accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default MergePeoplePage;
