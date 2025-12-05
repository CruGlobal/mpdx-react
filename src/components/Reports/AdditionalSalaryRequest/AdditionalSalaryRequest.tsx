import React from 'react';
import { Box } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { DirectionButtons } from 'src/components/Reports/Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../Shared/CalculationReports/StepsList/StepsList';
import { CurrentStep } from './CurrentStep';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';
import { SectionPage } from './SharedComponents/SectionPage';

export interface CompleteFormValues {
  currentYearSalary: string;
  previousYearSalary: string;
  additionalSalary: string;
  adoption: string;
  contribution403b: string;
  counseling: string;
  healthcareExpenses: string;
  babysitting: string;
  childrenMinistryTrip: string;
  childrenCollege: string;
  movingExpense: string;
  seminary: string;
  housingDownPayment: string;
  autoPurchase: string;
  reimbursableExpenses: string;
  defaultPercentage: boolean;
}

const MainContent: React.FC = () => {
  const { handleCancel, handlePreviousStep, handleNextStep, currentIndex } =
    useAdditionalSalaryRequest();
  const { submitForm, validateForm, submitCount, isValid } =
    useFormikContext<CompleteFormValues>();

  return (
    <Box px={theme.spacing(3)}>
      <CurrentStep />
      <DirectionButtons
        handleNextStep={handleNextStep}
        handlePreviousStep={handlePreviousStep}
        showBackButton={currentIndex !== 0}
        handleCancel={handleCancel}
        isSubmission={true}
        submitForm={submitForm}
        validateForm={validateForm}
        submitCount={submitCount}
        isValid={isValid}
      />
    </Box>
  );
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
