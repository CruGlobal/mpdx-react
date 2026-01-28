import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { SalaryCalculator } from 'src/components/Reports/SalaryCalculator/SalaryCalculator';
import {
  SalaryCalculatorProvider,
  useSalaryCalculator,
} from 'src/components/Reports/SalaryCalculator/SalaryCalculatorContext/SalaryCalculatorContext';
import { SavingStatus } from 'src/components/Reports/Shared/CalculationReports/SavingStatus/SavingStatus';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const SalaryCalculatorSavingStatus: React.FC = () => {
  const { calculation, isMutating, loading } = useSalaryCalculator();
  return (
    <SavingStatus
      loading={loading}
      hasData={!!calculation}
      isMutating={isMutating}
      lastSavedAt={calculation?.updatedAt ?? null}
    />
  );
};

export const SalaryCalculatorEditPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const [isNavListOpen, setIsNavListOpen] = useState(false);

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
          <SalaryCalculatorProvider>
            <MultiPageHeader
              isNavListOpen={isNavListOpen}
              onNavListToggle={handleNavListToggle}
              title={t('Salary Calculator')}
              headerType={HeaderTypeEnum.Report}
              rightExtra={<SalaryCalculatorSavingStatus />}
            />
            <SalaryCalculator />
          </SalaryCalculatorProvider>
        }
      />
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default SalaryCalculatorEditPage;
