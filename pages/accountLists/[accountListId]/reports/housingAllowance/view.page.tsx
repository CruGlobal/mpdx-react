import Head from 'next/head';
import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { MinisterHousingAllowanceProvider } from 'src/components/Reports/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
import { ViewRequestPage } from 'src/components/Reports/MinisterHousingAllowance/ViewRequest/ViewRequestPage';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';

const ViewRequestPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const HousingAllowanceViewRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const title = t("View Minister's Housing Allowance Request");

  const [isNavListOpen, setIsNavListOpen] = React.useState(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <ViewRequestPageWrapper>
        <SidePanelsLayout
          isScrollBox={false}
          leftPanel={
            <MultiPageMenu
              isOpen={isNavListOpen}
              selectedId={'housingAllowanceView'}
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
              <MinisterHousingAllowanceProvider type={PageEnum.View}>
                <ViewRequestPage />
              </MinisterHousingAllowanceProvider>
            </>
          }
        />
      </ViewRequestPageWrapper>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default HousingAllowanceViewRequestPage;
