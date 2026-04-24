import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { NewSalaryCalculatorLanding } from 'src/components/HrTools/SalaryCalculator/Landing/NewSalaryCalculationLanding/NewSalaryCalculatorLanding';
import { PendingSalaryCalculationLanding } from 'src/components/HrTools/SalaryCalculator/Landing/PendingSalaryCalculationLanding/PendingSalaryCalculationLanding';
import { useLandingData } from 'src/components/HrTools/SalaryCalculator/Landing/useLandingData';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
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
import { getAppName } from 'src/lib/getAppName';

const SalaryCalculatorPage: React.FC = () => {
  const appName = getAppName();
  const { t } = useTranslation();
  const [isNavListOpen, setIsNavListOpen] = useState(false);
  const { shouldShowPending } = useLandingData();

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('HR Tools | Salary Calculation Form')}`}</title>
      </Head>
      <UserTypeAccess
        requireStaffAccount
        requireUserGroups={RequiredUserGroupEnum.SalaryCalc}
      >
        <SidePanelsLayout
          isScrollBox={false}
          leftPanel={
            <MultiPageMenu
              isOpen={isNavListOpen}
              selectedId="salaryCalculator"
              onClose={handleNavListToggle}
              navType={NavTypeEnum.HrTools}
            />
          }
          leftOpen={isNavListOpen}
          leftWidth="290px"
          mainContent={
            <>
              <MultiPageHeader
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Salary Calculator')}
                headerType={HeaderTypeEnum.HrTools}
              />

              {shouldShowPending ? (
                <PendingSalaryCalculationLanding />
              ) : (
                <NewSalaryCalculatorLanding />
              )}
            </>
          }
        />
      </UserTypeAccess>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default SalaryCalculatorPage;
