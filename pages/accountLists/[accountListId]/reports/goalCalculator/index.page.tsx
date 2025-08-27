import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { GoalsList } from 'src/components/Reports/GoalCalculator/GoalsList/GoalsList';
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

const GoalCalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports - Goal Calculation')}`}</title>
      </Head>
      {accountListId ? (
        <ReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="goalCalculation"
                onClose={handleNavListToggle}
                designationAccounts={designationAccounts}
                setDesignationAccounts={setDesignationAccounts}
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
                  title={t('Goal Calculator')}
                  headerType={HeaderTypeEnum.Report}
                />
                <GoalsList />
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

export const getServerSideProps = ensureSessionAndAccountList;

export default GoalCalculatorPage;
