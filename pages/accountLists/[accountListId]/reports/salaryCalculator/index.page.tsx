import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { NewSalaryCalculatorLanding } from 'src/components/Reports/SalaryCalculator/Landing/NewSalaryCalculationLanding/NewSalaryCalculatorLanding';
import { PendingSalaryCalculationLanding } from 'src/components/Reports/SalaryCalculator/Landing/PendingSalaryCalculationLanding/PendingSalaryCalculationLanding';
import { useLandingData } from 'src/components/Reports/SalaryCalculator/Landing/useLandingData';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const SalaryCalculatorPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const [isNavListOpen, setIsNavListOpen] = useState(false);
  const { shouldShowPending } = useLandingData();

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Salary Calculator')}`}</title>
      </Head>
      <SidePanelsLayout
        isScrollBox={false}
        leftPanel={
          <MultiPageMenu
            isOpen={isNavListOpen}
            selectedId="salaryCalculator"
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
              title={t('Salary Calculator')}
              headerType={HeaderTypeEnum.Report}
            />

            {shouldShowPending ? (
              <PendingSalaryCalculationLanding />
            ) : (
              <NewSalaryCalculatorLanding />
            )}
          </>
        }
      />
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default SalaryCalculatorPage;
