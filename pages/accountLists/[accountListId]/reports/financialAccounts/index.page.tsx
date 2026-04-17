import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { FinancialAccounts } from 'src/components/Reports/FinancialAccountsReport/FinancialAccounts/FinancialAccounts';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { UserTypeAccess } from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useUserOptionQuery } from 'src/hooks/UserPreference.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const FinancialAccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();
  const [navListOpen, setNavListOpen] = useState(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  const { data: userOptionData } = useUserOptionQuery({
    variables: { key: 'user_type_verified' },
  });

  const handleNavListToggle = () => {
    setNavListOpen(!navListOpen);
  };
  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports - Responsibility Centers')}`}</title>
      </Head>

      {accountListId ? (
        <UserTypeAccess
          allowedUserType={UserTypeEnum.GlobalStaff}
          alwaysAllow={
            process.env.DISABLE_NEW_REPORTS === 'true' ||
            userOptionData?.userOption?.value !== 'true'
          }
        >
          <Box sx={{ background: 'common.white' }}>
            <SidePanelsLayout
              headerHeight={headerHeight}
              isScrollBox={false}
              leftOpen={navListOpen}
              leftWidth="290px"
              mainContent={
                <FinancialAccounts
                  accountListId={accountListId}
                  isNavListOpen={navListOpen}
                  designationAccounts={designationAccounts}
                  handleNavListToggle={handleNavListToggle}
                />
              }
              leftPanel={
                <MultiPageMenu
                  isOpen={navListOpen}
                  selectedId="financialAccounts"
                  onClose={handleNavListToggle}
                  designationAccounts={designationAccounts}
                  setDesignationAccounts={setDesignationAccounts}
                  navType={NavTypeEnum.Reports}
                />
              }
            />
          </Box>
        </UserTypeAccess>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default FinancialAccountsPage;
