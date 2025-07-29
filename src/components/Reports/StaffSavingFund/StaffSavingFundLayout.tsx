import Head from 'next/dist/shared/lib/head';
import React, { ReactElement, useContext, useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  StaffSavingFundContext,
  StaffSavingFundType,
} from './StaffSavingFundContext';

const StaffSavingFundPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

interface StaffSavingFundLayoutProps {
  pageTitle: string;
  selectedMenuId: 'staffSavingFund' | 'staffSavingFundTransfers';
  children: ReactElement;
}

export const StaffSavingFundLayout: React.FC<StaffSavingFundLayoutProps> = ({
  pageTitle,
  selectedMenuId,
  children,
}) => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  const { accountListId, isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} | ${pageTitle}`}</title>
      </Head>
      {accountListId ? (
        <StaffSavingFundPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId={selectedMenuId}
                onClose={onNavListToggle}
                designationAccounts={designationAccounts}
                setDesignationAccounts={setDesignationAccounts}
                navType={NavTypeEnum.Reports}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={children}
          />
        </StaffSavingFundPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};
