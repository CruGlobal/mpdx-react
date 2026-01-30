import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { Box, Stack } from '@mui/material';
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
import {
  CompleteFormValues,
  mainContentWidth,
} from '../AdditionalSalaryRequest';
import { EditForm } from '../FormVersions/Edit/EditForm';
import { NewForm } from '../FormVersions/New/NewForm';
import { ViewForm } from '../FormVersions/View/ViewForm';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { calculateCompletionPercentage } from '../Shared/calculateCompletionPercentage';
import { StepList } from '../SharedComponents/StepList';

const MainContent: React.FC = () => {
  const router = useRouter();
  const accountListId = useAccountListId();
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

  const handleDiscard = async () => {
    if (requestId) {
      await handleDeleteRequest(requestId, false);
      router.push(
        `/accountLists/${accountListId}/reports/additionalSalaryRequest`,
      );
    }
  };

  return (
    <Box px={theme.spacing(3)}>
      {pageType === PageEnum.View ? (
        <ViewForm />
      ) : (
        <>
          <StepList
            FormComponent={pageType === PageEnum.New ? NewForm : EditForm}
          />
          {!reviewPage && (
            <Stack direction="column" width={mainContentWidth}>
              <DirectionButtons
                handleNextStep={handleNextStep}
                handlePreviousStep={handlePreviousStep}
                showBackButton={!isFirstFormPage}
                handleDiscard={() => handleDiscard}
                isSubmission={isLastFormPage}
                submitForm={submitForm}
                validateForm={validateForm}
                submitCount={submitCount}
                isValid={isValid}
                isEdit={pageType === PageEnum.Edit}
              />
            </Stack>
          )}
        </>
      )}
    </Box>
  );
};

export const RequestPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const {
    pageType,
    isDrawerOpen,
    toggleDrawer,
    steps,
    currentIndex,
    staffAccountId,
    staffAccountIdLoading,
  } = useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();
  const iconPanelItems = useIconPanelItems(isDrawerOpen, toggleDrawer);

  const percentComplete = useMemo(
    () => calculateCompletionPercentage(values),
    [values],
  );

  if (!staffAccountId && !staffAccountIdLoading) {
    return <NoStaffAccount />;
  }

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      showPercentage={pageType !== PageEnum.View}
      percentComplete={percentComplete}
      steps={steps}
      currentIndex={currentIndex}
      icons={iconPanelItems}
      sidebarContent={
        pageType !== PageEnum.View ? <StepsList steps={steps} /> : null
      }
      sidebarTitle={
        pageType !== PageEnum.View
          ? t('Additional Salary Request')
          : t('Pending Request')
      }
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Additional Salary Request Sections')}
      mainContent={<MainContent />}
      backHref={`/accountLists/${accountListId}/reports/additionalSalaryRequest`}
    />
  );
};
