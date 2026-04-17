import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { NewSalaryCalculatorLanding } from 'src/components/Reports/SalaryCalculator/Landing/NewSalaryCalculationLanding/NewSalaryCalculatorLanding';
import { PendingSalaryCalculationLanding } from 'src/components/Reports/SalaryCalculator/Landing/PendingSalaryCalculationLanding/PendingSalaryCalculationLanding';
import { useLandingData } from 'src/components/Reports/SalaryCalculator/Landing/useLandingData';
import {
  SalaryCalculatorProvider,
  useSalaryCalculator,
} from 'src/components/Reports/SalaryCalculator/SalaryCalculatorContext/SalaryCalculatorContext';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { UserTypeAccess } from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

export const SalaryCalculatorOuterPage: React.FC = () => {
  return (
    <SalaryCalculatorProvider>
      <SalaryCalculatorPage />
    </SalaryCalculatorProvider>
  );
};

const SalaryCalculatorPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const [isNavListOpen, setIsNavListOpen] = useState(false);
  const { shouldShowPending } = useLandingData();
  const { calculation } = useSalaryCalculator();

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Salary Calculator')}`}</title>
      </Head>
      <UserTypeAccess
        requireStaffAccount
        requireUserGroups="salaryCalc"
        effectiveDate={calculation?.effectiveDate}
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

export default SalaryCalculatorOuterPage;
