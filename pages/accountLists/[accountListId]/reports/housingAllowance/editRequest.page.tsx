import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { EditRequestPage } from 'src/components/Reports/MinisterHousingAllowance/EditRequest/EditRequestPage';
import { ExpensesClaim } from 'src/components/Reports/MinisterHousingAllowance/NewRequest/Steps/StepThree/CalcComponents/ExpensesClaim';
import { PageEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';

const EditRequestPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const HousingAllowanceEditRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const title = t("Minister's Housing Allowance");

  const [isNavListOpen, setNavListOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOnOpen = () => {
    setIsOpen(true);
  };

  const handleOnClose = () => {
    setIsOpen(false);
  };

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${title} - Edit Request`}</title>
      </Head>
      <EditRequestPageWrapper>
        <SidePanelsLayout
          isScrollBox={false}
          leftPanel={
            <MultiPageMenu
              isOpen={isNavListOpen}
              selectedId={'housingAllowanceEditRequest'}
              onClose={handleNavListToggle}
              navType={NavTypeEnum.Reports}
            />
          }
          leftOpen={isNavListOpen}
          leftWidth="290px"
          mainContent={
            <>
              <MultiPageHeader
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t("Minister's Housing Allowance Request")}
                headerType={HeaderTypeEnum.Report}
              />
              <EditRequestPage type={PageEnum.Edit} onOpen={handleOnOpen} />
            </>
          }
          rightPanel={
            isOpen ? <ExpensesClaim onClose={handleOnClose} /> : undefined
          }
          rightOpen={isOpen}
          rightWidth="40%"
        />
      </EditRequestPageWrapper>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default HousingAllowanceEditRequestPage;
