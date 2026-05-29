import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { RequestPage } from 'src/components/HrTools/MinisterHousingAllowance/RequestPage/RequestPage';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from 'src/components/HrTools/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { SavingStatus } from 'src/components/HrTools/Shared/CalculationReports/SavingStatus/SavingStatus';
import { PageEnum } from 'src/components/HrTools/Shared/CalculationReports/Shared/sharedTypes';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { SimpleScreenOnly } from 'src/components/Reports/styledComponents';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import {
  RequiredUserGroupEnum,
  UserTypeAccess,
} from 'src/components/Shared/UserTypeAccess/UserTypeAccess';

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

export const HousingAllowanceRequestPageContent: React.FC = () => {
  const { t } = useTranslation();
  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const { requestData, loading, isMutating, pageType } =
    useMinisterHousingAllowance();

  const title = t("{{mode}} Minister's Housing Allowance Calculation Tool", {
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
      <UserTypeAccess
        requireStaffAccount
        requireUserGroups={RequiredUserGroupEnum.Mha}
      >
        <RequestPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId={'mhaCalculator' + pageType}
                onClose={handleNavListToggle}
                navType={NavTypeEnum.HrTools}
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
                    title={t("Minister's Housing Allowance Calculation Tool")}
                    rightExtra={
                      <SavingStatus
                        loading={loading}
                        hasData={!!requestData}
                        isMutating={isMutating}
                        lastSavedAt={requestData?.updatedAt ?? null}
                      />
                    }
                    headerType={HeaderTypeEnum.HrTools}
                  />
                </SimpleScreenOnly>
                <RequestPage />
              </>
            }
          />
        </RequestPageWrapper>
      </UserTypeAccess>
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
