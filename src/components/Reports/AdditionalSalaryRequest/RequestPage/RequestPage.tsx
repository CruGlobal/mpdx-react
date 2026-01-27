import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { DirectionButtons } from 'src/components/Reports/Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { NoStaffAccount } from 'src/components/Reports/Shared/NoStaffAccount/NoStaffAccount';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { PanelLayout } from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../../Shared/CalculationReports/StepsList/StepsList';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { CurrentStep } from '../CurrentStep';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { calculateCompletionPercentage } from '../Shared/calculateCompletionPercentage';

export const mainContentWidth = theme.spacing(85);

const MainContent: React.FC = () => {
  const {
    handlePreviousStep,
    handleNextStep,
    currentIndex,
    steps,
    handleDeleteRequest,
    requestId,
    pageType,
  } = useAdditionalSalaryRequest();

  const { submitForm, validateForm, submitCount, isValid } =
    useFormikContext<CompleteFormValues>();

  const isFirstFormPage = currentIndex === 0;
  const isLastFormPage = currentIndex === steps.length - 2;
  const reviewPage = currentIndex === steps.length - 1;

  return (
    <Box px={theme.spacing(3)}>
      <CurrentStep />
      {!reviewPage && (
        <DirectionButtons
          handleNextStep={handleNextStep}
          handlePreviousStep={handlePreviousStep}
          showBackButton={!isFirstFormPage}
          handleDiscard={() => requestId && handleDeleteRequest(requestId)}
          isSubmission={isLastFormPage && pageType !== PageEnum.View}
          submitForm={submitForm}
          validateForm={validateForm}
          submitCount={submitCount}
          isValid={isValid}
        />
      )}
    </Box>
  );
};

export const RequestPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { isDrawerOpen, toggleDrawer, steps, currentIndex, staffAccountId } =
    useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();

  const percentComplete = useMemo(
    () => calculateCompletionPercentage(values),
    [values],
  );

  if (!staffAccountId) {
    return <NoStaffAccount />;
  }

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
      mainContent={<MainContent />}
      backHref={`/accountLists/${accountListId}/reports/additionalSalaryRequest`}
    />
  );
};
