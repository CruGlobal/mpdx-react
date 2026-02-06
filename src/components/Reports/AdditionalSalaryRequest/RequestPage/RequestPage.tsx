import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
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
import { useCreateAdditionalSalaryRequestMutation } from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { EditForm } from '../FormVersions/Edit/EditForm';
import { NewForm } from '../FormVersions/New/NewForm';
import { ViewForm } from '../FormVersions/View/ViewForm';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { calculateCompletionPercentage } from '../Shared/calculateCompletionPercentage';
import { useSalaryCalculations } from '../Shared/useSalaryCalculations';
import { StepList } from '../SharedComponents/StepList';
import { CapSubContent } from './CapSubContent';

const MainContent: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();

  const {
    handlePreviousStep,
    handleNextStep,
    currentIndex,
    steps,
    handleDeleteRequest,
    requestId,
    requestData,
    pageType,
    loading,
    trackMutation,
    user,
  } = useAdditionalSalaryRequest();

  const [createRequest] = useCreateAdditionalSalaryRequestMutation();

  const { values, submitForm, validateForm, submitCount, isValid, errors } =
    useFormikContext<CompleteFormValues>();

  const handleContinue = async () => {
    if (requestData?.latestAdditionalSalaryRequest === null) {
      trackMutation(
        createRequest({
          variables: {
            attributes: {
              phoneNumber: user?.staffInfo?.primaryPhoneNumber,
              emailAddress: user?.staffInfo?.emailAddress,
            },
          },
          refetchQueries: ['AdditionalSalaryRequest'],
        }),
      );
    }
    handleNextStep();
  };

  const { exceedsCap } = useSalaryCalculations({
    values,
  });

  const handleDiscard = async () => {
    if (requestId) {
      await handleDeleteRequest(requestId, false);
      router.push(
        `/accountLists/${accountListId}/reports/additionalSalaryRequest`,
      );
    }
  };

  const isEdit = pageType === PageEnum.Edit;

  const isFirstFormPage = currentIndex === 0;
  const isLastFormPage = currentIndex === steps.length - 2;
  const reviewPage = currentIndex === steps.length - 1;

  const capTitle = t(
    'Your request requires additional approval. Please fill in the information below to continue.',
  );
  const capContent = t(
    'Your request causes your Total Requested Salary to exceed your Maximum Allowable Salary.',
  );

  if (loading && !requestData) {
    return <Loading loading={loading} />;
  }

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
                formTitle={t('Additional Salary Request')}
                overrideTitle={exceedsCap ? capTitle : undefined}
                overrideContent={exceedsCap ? capContent : undefined}
                overrideSubContent={
                  exceedsCap ? (
                    <CapSubContent />
                  ) : isEdit ? (
                    t('Your updated request will be sent to payroll.')
                  ) : (
                    t('Your request will be sent to payroll.')
                  )
                }
                handleNextStep={handleNextStep}
                handlePreviousStep={handlePreviousStep}
                showBackButton={!isFirstFormPage}
                handleDiscard={requestId ? handleDiscard : undefined}
                isSubmission={isLastFormPage}
                submitForm={submitForm}
                validateForm={validateForm}
                submitCount={submitCount}
                isValid={isValid}
                actionRequired={isEdit}
                isEdit={isEdit}
                exceedsCap={exceedsCap}
                disableSubmit={exceedsCap && !!errors.additionalInfo}
                overrideNext={isFirstFormPage ? handleContinue : undefined}
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
    currentStep,
    staffAccountId,
    staffAccountIdLoading,
  } = useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();
  const iconPanelItems = useIconPanelItems(isDrawerOpen, toggleDrawer);

  const isNew = pageType === PageEnum.New;
  const isAboutFormStep =
    currentStep === AdditionalSalaryRequestSectionEnum.AboutForm;
  const hideBackHref = isNew && isAboutFormStep;

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
      backHref={
        hideBackHref
          ? ''
          : `/accountLists/${accountListId}/reports/additionalSalaryRequest`
      }
    />
  );
};
