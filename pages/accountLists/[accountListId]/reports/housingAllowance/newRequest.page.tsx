import Head from 'next/dist/shared/lib/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { NewRequestPage } from 'src/components/Reports/MinisterHousingAllowance/NewRequest/NewRequestPage';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';

const NewRequestPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const HousingAllowanceNewRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const title = t("Minister's Housing Allowance");

  const [isNavListOpen, setNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${title} - New Request`}</title>
      </Head>
      <NewRequestPageWrapper>
        <SidePanelsLayout
          isScrollBox={false}
          leftPanel={
            <MultiPageMenu
              isOpen={isNavListOpen}
              selectedId={'housingAllowanceNewRequest'}
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
              <NewRequestPage />
            </>
          }
        />
      </NewRequestPageWrapper>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default HousingAllowanceNewRequestPage;
