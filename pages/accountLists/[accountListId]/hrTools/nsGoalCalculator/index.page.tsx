import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { NsGoalCalculator } from 'src/components/HrTools/NsGoalCalculator/NsGoalCalculator';
import { NsGoalCalculatorProvider } from 'src/components/HrTools/NsGoalCalculator/Shared/NsGoalCalculatorContext';
import { NsGoalCalculatorLayout } from 'src/components/HrTools/NsGoalCalculator/Shared/NsGoalCalculatorLayout';
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

interface NsGoalCalculatorContentProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
}

const NsGoalCalculatorContent: React.FC<NsGoalCalculatorContentProps> = ({
  isNavListOpen,
  onNavListToggle,
}) => {
  const { t } = useTranslation();

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        <MultiPageMenu
          isOpen={isNavListOpen}
          selectedId="nsGoalCalculator"
          onClose={onNavListToggle}
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
            onNavListToggle={onNavListToggle}
            title={t('New Staff Goal Calculator')}
            headerType={HeaderTypeEnum.HrTools}
          />
          <NsGoalCalculatorLayout mainContent={<NsGoalCalculator />} />
        </>
      }
    />
  );
};

export const NsGoalCalculatorPage: React.FC = () => {
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
        <title>{`${appName} | ${t(
          'HR Tools | New Staff Goal Calculator',
        )}`}</title>
      </Head>
      {accountListId ? (
        <UserTypeAccess requireUserGroups={RequiredUserGroupEnum.NsGoalCalc}>
          <ReportPageWrapper>
            <NsGoalCalculatorProvider>
              <NsGoalCalculatorContent
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
              />
            </NsGoalCalculatorProvider>
          </ReportPageWrapper>
        </UserTypeAccess>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default NsGoalCalculatorPage;
