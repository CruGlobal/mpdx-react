import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import MergePeople from '../../../../src/components/Tool/MergePeople/MergePeople';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import Loading from '../../../../src/components/Loading';

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
