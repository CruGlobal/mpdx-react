import Head from 'next/dist/shared/lib/head';
import React, { ReactElement, useContext } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useStaffAccountQuery } from '../StaffAccount.generated';
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
  const { isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;

  const { data: staffAccountData } = useStaffAccountQuery();

  return (
    <>
      <Head>
        <title>{`${pageTitle}`}</title>
      </Head>
      {staffAccountData?.staffAccount?.accountId ? (
        <StaffSavingFundPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId={selectedMenuId}
                onClose={onNavListToggle}
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
