import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { GoalsList } from 'src/components/HrTools/GoalCalculator/GoalsList/GoalsList';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import {
  RequiredUserGroupEnum,
  UserTypeAccess,
} from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/ReportPageWrapper';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';

export const GoalCalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const accountListId = useAccountListId();

  const [isNavListOpen, setNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('HR Tools | MPD Goal Calculator')}`}</title>
      </Head>
      {accountListId ? (
        <UserTypeAccess
          requireStaffAccount
          requireUserGroups={RequiredUserGroupEnum.MpdGoalCalc}
        >
          <ReportPageWrapper>
            <SidePanelsLayout
              isScrollBox={false}
              leftPanel={
                <MultiPageMenu
                  isOpen={isNavListOpen}
                  selectedId="goalCalculation"
                  onClose={handleNavListToggle}
                  navType={NavTypeEnum.HrTools}
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
                    headerType={HeaderTypeEnum.HrTools}
                  />
                  <GoalsList />
                </>
              }
            />
          </ReportPageWrapper>
        </UserTypeAccess>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default GoalCalculatorPage;
