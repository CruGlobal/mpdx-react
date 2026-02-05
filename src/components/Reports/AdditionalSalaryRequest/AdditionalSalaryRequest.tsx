import React, { useCallback, useMemo } from 'react';
import { Button, Container, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Notification } from 'src/components/Notification/Notification';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { useCreateAdditionalSalaryRequestMutation } from './AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSkeleton } from './AdditionalSalaryRequestSkeleton';
import { EligibleDisplay } from './MainPages/EligibleDisplay';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';
import { getRequestUrl } from './Shared/Helper/getRequestUrl';
import { ApprovedRequest } from './SharedComponents/ApprovedRequest';
import { CurrentRequest } from './SharedComponents/CurrentRequest';

export const mainContentWidth = theme.spacing(85);

export interface CompleteFormValues {
  currentYearSalaryNotReceived: string;
  previousYearSalaryNotReceived: string;
  additionalSalaryWithinMax: string;
  adoption: string;
  traditional403bContribution: string;
  counselingNonMedical: string;
  healthcareExpensesExceedingLimit: string;
  babysittingMinistryEvents: string;
  childrenMinistryTripExpenses: string;
  childrenCollegeEducation: string;
  movingExpense: string;
  seminary: string;
  housingDownPayment: string;
  autoPurchase: string;
  expensesNotApprovedWithin90Days: string;
  deductTwelvePercent: boolean;
  phoneNumber: string;
  totalAdditionalSalaryRequested: string;
  additionalInfo: string;
  emailAddress: string;
}

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const {
    isDrawerOpen,
    toggleDrawer,
    steps,
    currentIndex,
    requestError,
    requestData,
    user,
    loading: requestLoading,
  } = useAdditionalSalaryRequest();

  const request = requestData?.latestAdditionalSalaryRequest;

  const [createAdditionalSalaryRequest] =
    useCreateAdditionalSalaryRequestMutation();

  const iconPanelItems = useIconPanelItems(isDrawerOpen, toggleDrawer);

  const handleCreateAsrRequest = useCallback(() => {
    createAdditionalSalaryRequest({
      variables: {
        attributes: {
          phoneNumber: user?.staffInfo?.primaryPhoneNumber,
          emailAddress: user?.staffInfo?.emailAddress,
        },
      },
      refetchQueries: ['AdditionalSalaryRequest'],
      onCompleted: ({ createAdditionalSalaryRequest: newRequest }) => {
        enqueueSnackbar(
          t("Successfully created ASR Request. You'll be redirected shortly."),
          {
            variant: 'success',
          },
        );
        const asrRequestId = newRequest?.additionalSalaryRequest.id;
        const requestLink = getRequestUrl(accountListId, asrRequestId, 'new');

        // Wait 1 second before redirecting
        setTimeout(() => {
          window.location.href = requestLink;
        }, 1000);
      },
      onError: (err) => {
        enqueueSnackbar(
          t('Error while creating ASR Request - {{error}}', {
            error: err.message,
          }),
          {
            variant: 'error',
          },
        );
      },
    });
  }, [createAdditionalSalaryRequest, enqueueSnackbar, t, accountListId, user]);

  // Determine overall request status based on priority
  const allRequestStatus = useMemo((): string => {
    if (!request) {
      return t('None');
    }
    switch (request.status) {
      case AsrStatusEnum.Approved:
        return t('Approved');
      case AsrStatusEnum.ActionRequired:
        return t('Action Required');
      case AsrStatusEnum.Pending:
        return t('Pending');
      case AsrStatusEnum.InProgress:
        return t('In Progress');
    }
    return t('None');
  }, [request, t]);

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={0}
      showPercentage={false}
      steps={steps}
      currentIndex={currentIndex}
      icons={iconPanelItems}
      sidebarTitle={t('Additional Salary Request')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Additional Salary Request Sections')}
      mainContent={
        <Container sx={{ ml: 5 }}>
          {requestError ? (
            <Notification type="error" message={requestError.message} />
          ) : requestLoading ? (
            <AdditionalSalaryRequestSkeleton />
          ) : (
            <Stack
              direction="column"
              sx={{
                gap: theme.spacing(4),
              }}
              width={mainContentWidth}
            >
              <EligibleDisplay allRequestStatus={allRequestStatus} />

              {request &&
                (request.status === AsrStatusEnum.Approved ? (
                  <ApprovedRequest request={request} />
                ) : (
                  <CurrentRequest request={request} />
                ))}
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateAsrRequest}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('Create New ASR')}
              </Button>
            </Stack>
          )}
        </Container>
      }
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
