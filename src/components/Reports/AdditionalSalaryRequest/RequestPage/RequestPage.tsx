import React, { useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { DirectionButtons } from 'src/components/Reports/Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { NoStaffAccount } from 'src/components/Reports/Shared/NoStaffAccount/NoStaffAccount';
import { AsrStatusEnum } from 'src/graphql/types.generated';
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
import { EditForm } from '../FormVersions/Edit/EditForm';
import { NewForm } from '../FormVersions/New/NewForm';
import { ViewForm } from '../FormVersions/View/ViewForm';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { calculateCompletionPercentage } from '../Shared/calculateCompletionPercentage';
import { useSalaryCalculations } from '../Shared/useSalaryCalculations';
import { StepList } from '../SharedComponents/StepList';
import { CapSubContent } from './Helper/CapSubContent';
import { SplitCapSubContent } from './Helper/SplitCapSubContent';
import { getCapOverrides } from './Helper/getCapOverrides';

const MainContent: React.FC = () => {
  const { t } = useTranslation();

  const {
    handlePreviousStep,
    handleNextStep,
    currentIndex,
    steps,
    handleDeleteRequest,
    requestId,
    requestData,
    pageType,
    setPageType,
    loading,
    trackMutation,
    user,
    isSpouse,
    setIsNewAsr,
  } = useAdditionalSalaryRequest();

  const [createRequest] = useCreateAdditionalSalaryRequestMutation();

  const { values, submitForm, validateForm, submitCount, isValid, errors } =
    useFormikContext<CompleteFormValues>();

  const handleContinue = async () => {
    if (requestData?.latestAdditionalSalaryRequest === null) {
      await trackMutation(
        createRequest({
          variables: {
            attributes: {
              phoneNumber: user?.staffInfo?.primaryPhoneNumber,
              emailAddress: user?.staffInfo?.emailAddress,
            },
            isSpouse: isSpouse || undefined,
          },
          refetchQueries: ['AdditionalSalaryRequest'],
        }),
      );
      setPageType(PageEnum.New);
      setIsNewAsr(true);
    } else {
      setPageType(PageEnum.Edit);
    }
    handleNextStep();
  };

  const { exceedsCap, splitAsr, additionalApproval } = useSalaryCalculations({
    values,
  });

  const handleDiscard = async () => {
    if (requestId) {
      await handleDeleteRequest(requestId, false);
    }
  };

  const isEdit = pageType === PageEnum.Edit;

  const isFirstFormPage = currentIndex === 0;
  const isLastFormPage = currentIndex === steps.length - 2;
  const reviewPage = currentIndex === steps.length - 1;
  const isFormPage = !isFirstFormPage && !reviewPage;

  const { title: overrideTitle, content: overrideContent } = getCapOverrides(
    !!splitAsr,
    !!additionalApproval,
    exceedsCap,
    t,
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
                overrideTitle={overrideTitle}
                overrideContent={overrideContent}
                overrideSubContent={
                  splitAsr ? (
                    <SplitCapSubContent
                      spouseName={spouse?.staffInfo.firstName ?? ''}
                    />
                  ) : additionalApproval || exceedsCap ? (
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
                handleDiscard={
                  requestId && isFormPage ? handleDiscard : undefined
                }
                isSubmission={isLastFormPage}
                submitForm={submitForm}
                validateForm={validateForm}
                submitCount={submitCount}
                isValid={isValid}
                actionRequired={isEdit}
                isEdit={isEdit}
                additionalApproval={additionalApproval || exceedsCap}
                splitAsr={splitAsr}
                disableSubmit={
                  (splitAsr && !!errors.additionalInfo) ||
                  (exceedsCap && !!errors.additionalInfo)
                }
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
  const {
    pageType,
    isDrawerOpen,
    toggleDrawer,
    steps,
    currentIndex,
    staffAccountId,
    staffAccountIdLoading,
    requestData,
    setPageType,
  } = useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();
  const iconPanelItems = useIconPanelItems(isDrawerOpen, toggleDrawer);
  const status = requestData?.latestAdditionalSalaryRequest?.status;
  const showBackButton =
    status === AsrStatusEnum.ActionRequired || status === AsrStatusEnum.Pending;
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
      onBack={showBackButton ? () => setPageType(PageEnum.Reset) : undefined}
    />
  );
};
