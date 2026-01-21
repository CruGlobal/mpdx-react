import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { DynamicExpensesClaim } from 'src/components/Reports/MinisterHousingAllowance/DynamicExpensesClaim/DynamicExpensesClaim';
import { RequestPage } from 'src/components/Reports/MinisterHousingAllowance/RequestPage/RequestPage';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from 'src/components/Reports/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
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

interface HousingAllowanceRequestContentProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
}

const HousingAllowanceRequestContent: React.FC<
  HousingAllowanceRequestContentProps
> = ({ isNavListOpen, onNavListToggle }) => {
  const { t } = useTranslation();
  const { isRightPanelOpen } = useMinisterHousingAllowance();

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        <MultiPageMenu
          isOpen={isNavListOpen}
          selectedId="housingAllowance"
          onClose={onNavListToggle}
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
              onNavListToggle={onNavListToggle}
              title={t("Minister's Housing Allowance Request")}
              headerType={HeaderTypeEnum.Report}
            />
          </SimpleScreenOnly>
          <RequestPage />
        </>
      }
      rightPanel={isRightPanelOpen ? <DynamicExpensesClaim /> : undefined}
      rightOpen={isRightPanelOpen}
      rightWidth="35%"
    />
  );
};

const HousingAllowanceRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { requestId, mode } = router.query;

  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  if (!requestId) {
    return <CircularProgress />;
  }

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

  const pageType = getPageType(mode);
  if (!pageType) {
    return null;
  }

  const title = t("{{mode}} Minister's Housing Allowance Request", {
    mode: pageType,
  });

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <RequestPageWrapper>
        <MinisterHousingAllowanceProvider
          type={pageType}
          requestId={requestId as string}
        >
          <HousingAllowanceRequestContent
            isNavListOpen={isNavListOpen}
            onNavListToggle={handleNavListToggle}
          />
        </MinisterHousingAllowanceProvider>
      </RequestPageWrapper>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default HousingAllowanceRequestPage;
