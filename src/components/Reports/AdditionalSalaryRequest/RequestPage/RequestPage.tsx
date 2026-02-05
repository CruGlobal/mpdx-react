import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { Box, List, ListItemText, Stack } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { DirectionButtons } from 'src/components/Reports/Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { NoStaffAccount } from 'src/components/Reports/Shared/NoStaffAccount/NoStaffAccount';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { StyledListItem } from '../../SavingsFundTransfer/styledComponents/StyledListItem';
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
import { StepList } from '../SharedComponents/StepList';

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
    pageType,
    exceedsCap,
    loading,
    trackMutation,
  } = useAdditionalSalaryRequest();

  const [createRequest] = useCreateAdditionalSalaryRequestMutation();

  const { submitForm, validateForm, submitCount, isValid, errors } =
    useFormikContext<CompleteFormValues>();

  const handleCreateAndContinue = async () => {
    const result = await trackMutation(
      createRequest({
        variables: { attributes: {} },
        refetchQueries: ['AdditionalSalaryRequest'],
      }),
    );
    if (
      result.data?.createAdditionalSalaryRequest?.additionalSalaryRequest.id
    ) {
      handleNextStep();
    }
  };

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
  const capSubContent = (
    <>
      <Trans i18nKey="contactPayrollToIncreaseCap" parent="span">
        Please complete the Approval Process section below and we will review
        your request through our{' '}
        <Link
          href="/"
          style={{ display: 'inline', color: theme.palette.primary.main }}
        >
          Progressive Approvals
        </Link>{' '}
        process. Please note:
      </Trans>
      <Box>
        <List sx={{ listStyleType: 'disc', pl: 4 }} disablePadding>
          <StyledListItem sx={{ py: 0 }}>
            <ListItemText
              primary={t(
                'For the [Amount] you are requesting, this will take [time frame] as it needs to be signed off by [approvers].',
              )}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItem>
          <StyledListItem sx={{ py: 0 }}>
            <ListItemText
              primary={t(
                'No additional salary can be requested while this request is pending.',
              )}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItem>
        </List>
      </Box>
    </>
  );

  if (loading) {
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
                  exceedsCap
                    ? capSubContent
                    : isEdit
                      ? t('Your updated request will be sent to payroll.')
                      : t('Your request will be sent to payroll.')
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
                overrideNext={
                  isFirstFormPage ? handleCreateAndContinue : undefined
                }
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
