import Head from 'next/dist/shared/lib/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { SavingsFundTransfer } from 'src/components/Reports/SavingsFundTransfer/SavingsFundTransfer';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const SavingsFundTransferPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const SavingsFundTransferPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);
  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} | ${t(
          'Savings Fund Transfer',
        )}`}</title>
      </Head>
      {accountListId ? (
        <SavingsFundTransferPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="savingsFundTransfer"
                onClose={handleNavListToggle}
                designationAccounts={designationAccounts}
                setDesignationAccounts={setDesignationAccounts}
                navType={NavTypeEnum.Reports}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <SavingsFundTransfer
                accountListId={accountListId}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Savings Fund Transfer')}
              />
            }
          />
        </SavingsFundTransferPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default SavingsFundTransferPage;
