import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { EditRequestPage } from 'src/components/Reports/MinisterHousingAllowance/EditRequest/EditRequestPage';
import { MinisterHousingAllowanceProvider } from 'src/components/Reports/MinisterHousingAllowance/Shared/MinisterHousingAllowanceContext';
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
  const title = t("Edit Minister's Housing Allowance Request");

  const [isNavListOpen, setNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <EditRequestPageWrapper>
        <SidePanelsLayout
          isScrollBox={false}
          leftPanel={
            <MultiPageMenu
              isOpen={isNavListOpen}
              selectedId={'housingAllowanceEdit'}
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
              <MinisterHousingAllowanceProvider type={PageEnum.Edit}>
                <EditRequestPage />
              </MinisterHousingAllowanceProvider>
            </>
          }
        />
      </EditRequestPageWrapper>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default HousingAllowanceEditRequestPage;
