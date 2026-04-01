import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { PdsGoalsList } from 'src/components/Reports/PdsGoalCalculator/GoalsList/PdsGoalsList';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/ReportPageWrapper';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const PdsGoalCalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = React.useState(false);

  const handleNavListToggle = () => {
    setNavListOpen((prev) => !prev);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports - Paid with Designation Support Goal Calculator')}`}</title>
      </Head>
      {accountListId ? (
        <ReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="pdsGoalCalculator"
                onClose={handleNavListToggle}
                navType={NavTypeEnum.Reports}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            headerHeight={multiPageHeaderHeight}
            mainContent={
              <>
                <MultiPageHeader
                  isNavListOpen={isNavListOpen}
                  onNavListToggle={handleNavListToggle}
                  title={t('Paid with Designation Support Goal Calculator')}
                  headerType={HeaderTypeEnum.Report}
                />
                <PdsGoalsList />
              </>
            }
          />
        </ReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default PdsGoalCalculatorPage;
