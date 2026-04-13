import Head from 'next/dist/shared/lib/head';
import React, { ReactElement, useContext } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { UserTypeAccess } from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
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

  return (
    <UserTypeAccess requireStaffAccount>
      <>
        <Head>
          <title>{`${pageTitle}`}</title>
        </Head>
        <StaffSavingFundPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId={selectedMenuId}
                onClose={onNavListToggle}
                navType={NavTypeEnum.HrTools}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={children}
          />
        </StaffSavingFundPageWrapper>
      </>
    </UserTypeAccess>
  );
};
