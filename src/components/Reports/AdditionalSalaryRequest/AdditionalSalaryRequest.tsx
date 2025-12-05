import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { Receipt } from '../Shared/CalculationReports/ReceiptStep/Receipt';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../Shared/CalculationReports/StepsList/StepsList';
import { AboutForm } from './AboutForm/AboutForm';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import { CompleteForm } from './CompleteForm/CompleteForm';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestSection } from './SharedComponents/AdditionalSalaryRequestSection';
import { SectionPage } from './SharedComponents/SectionPage';

export const MainContent: React.FC = () => {
  const { currentStep } = useAdditionalSalaryRequest();
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const pageLink = `/accountLists/${accountListId}/reports/additionalSalaryRequest`;

  switch (currentStep) {
    case AdditionalSalaryRequestSectionEnum.AboutForm:
      return <AboutForm />;
    case AdditionalSalaryRequestSectionEnum.CompleteForm:
      return <CompleteForm />;
    case AdditionalSalaryRequestSectionEnum.Receipt:
      return (
        <AdditionalSalaryRequestSection>
          <Receipt
            formTitle={t('Additional Salary Request')}
            buttonText={t('View Your Additional Salary Request')}
            viewLink={pageLink}
            isEdit={false}
          />
        </AdditionalSalaryRequestSection>
      );
  }
};

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { isDrawerOpen, toggleDrawer, steps, currentIndex, percentComplete } =
    useAdditionalSalaryRequest();

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={percentComplete}
      steps={steps}
      currentIndex={currentIndex}
      icons={useIconPanelItems(isDrawerOpen, toggleDrawer)}
      sidebarContent={<StepsList steps={steps} />}
      sidebarTitle={t('Additional Salary Request')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Additional Salary Request Sections')}
      mainContent={
        <SectionPage>
          <MainContent />
        </SectionPage>
      }
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
