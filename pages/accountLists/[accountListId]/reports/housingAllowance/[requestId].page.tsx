import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { RequestPage } from 'src/components/Reports/MinisterHousingAllowance/RequestPage/RequestPage';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from 'src/components/Reports/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { SavingStatus } from 'src/components/Reports/Shared/CalculationReports/SavingStatus/SavingStatus';
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

const getPageType = (mode: string | string[] | undefined) => {
  switch (mode) {
    case 'new':
      return PageEnum.New;
    case 'edit':
      return PageEnum.Edit;
    case 'view':
      return PageEnum.View;
    default:
      return undefined;
  }
};

const HousingAllowanceRequestPageContent: React.FC = () => {
  const { t } = useTranslation();
  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const { requestData, loading, isMutating, pageType } =
    useMinisterHousingAllowance();

  const title = t("{{mode}} Minister's Housing Allowance Request", {
    mode: pageType,
  });

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
              selectedId={'housingAllowance' + pageType}
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
                  rightExtra={
                    <SavingStatus
                      loading={loading}
                      hasData={!!requestData}
                      isMutating={isMutating}
                      lastSavedAt={requestData?.updatedAt ?? null}
                    />
                  }
                  headerType={HeaderTypeEnum.Report}
                />
              </SimpleScreenOnly>
              <RequestPage />
            </>
          }
        />
      </RequestPageWrapper>
    </>
  );
};

const HousingAllowanceRequestPage: React.FC = () => {
  const router = useRouter();
  const { requestId, mode } = router.query;

  const pageType = getPageType(mode);

  if (!requestId || !pageType) {
    return <CircularProgress />;
  }

  return (
    <MinisterHousingAllowanceProvider
      type={pageType}
      requestId={requestId as string}
    >
      <HousingAllowanceRequestPageContent />
    </MinisterHousingAllowanceProvider>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default HousingAllowanceRequestPage;
