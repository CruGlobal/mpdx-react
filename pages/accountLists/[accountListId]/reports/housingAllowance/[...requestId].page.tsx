import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { EditRequestPage } from 'src/components/Reports/MinisterHousingAllowance/EditRequest/EditRequestPage';
import { NewRequestPage } from 'src/components/Reports/MinisterHousingAllowance/NewRequest/NewRequestPage';
import { MinisterHousingAllowanceProvider } from 'src/components/Reports/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
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
  const { requestId } = router.query;

  if (!requestId) {
    return null;
  }

  const [mode] = Array.isArray(requestId) ? requestId : [requestId];
  const type = mode === PageEnum.New ? PageEnum.New : PageEnum.Edit;

  const title = t("{{mode}} Minister's Housing Allowance Request", {
    mode: type === PageEnum.New ? 'New' : 'Edit',
  });

  const [isNavListOpen, setNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
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
              <MultiPageHeader
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t("Minister's Housing Allowance Request")}
                headerType={HeaderTypeEnum.Report}
              />
              <MinisterHousingAllowanceProvider type={type}>
                {type === PageEnum.New ? (
                  <NewRequestPage />
                ) : (
                  <EditRequestPage />
                )}
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
