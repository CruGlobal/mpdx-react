import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { RequestPage } from 'src/components/Reports/MinisterHousingAllowance/RequestPage/RequestPage';
import { MinisterHousingAllowanceProvider } from 'src/components/Reports/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { SimpleScreenOnly } from 'src/components/Reports/styledComponents';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';

const RequestPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const HousingAllowanceRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { requestId, mode } = router.query;

  if (!requestId) {
    return null;
  }

  const type =
    mode === 'new'
      ? PageEnum.New
      : mode === 'edit'
        ? PageEnum.Edit
        : mode === 'view'
          ? PageEnum.View
          : undefined;

  const title = t("{{mode}} Minister's Housing Allowance Request", {
    mode:
      type === PageEnum.New ? 'New' : type === PageEnum.Edit ? 'Edit' : 'View',
  });

  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <RequestPageWrapper>
        <SidePanelsLayout
          isScrollBox={false}
          leftPanel={
            <MultiPageMenu
              isOpen={isNavListOpen}
              selectedId={'housingAllowance' + type}
              onClose={handleNavListToggle}
              navType={NavTypeEnum.Reports}
            />
          }
          leftOpen={isNavListOpen}
          leftWidth="290px"
          mainContent={
            <>
              <SimpleScreenOnly>
                <MultiPageHeader
                  isNavListOpen={isNavListOpen}
                  onNavListToggle={handleNavListToggle}
                  title={t("Minister's Housing Allowance Request")}
                  headerType={HeaderTypeEnum.Report}
                />
              </SimpleScreenOnly>
              <MinisterHousingAllowanceProvider
                type={type}
                requestId={requestId as string}
              >
                <RequestPage />
              </MinisterHousingAllowanceProvider>
            </>
          }
        />
      </RequestPageWrapper>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default HousingAllowanceRequestPage;
