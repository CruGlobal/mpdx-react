import React, { useMemo } from 'react';
import { Button, Container, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Notification } from 'src/components/Notification/Notification';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { AdditionalSalaryRequestSkeleton } from './AdditionalSalaryRequestSkeleton';
import { EligibleDisplay } from './MainPages/EligibleDisplay';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';
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
}

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const {
    isDrawerOpen,
    toggleDrawer,
    steps,
    currentIndex,
    requestsError,
    requestsData,
    createAdditionalSalaryRequest,
  } = useAdditionalSalaryRequest();

  // Determine overall request status based on priority
  const allRequestStatus = useMemo((): string => {
    if (!requestsData || requestsData.length === 0) {
      return 'None';
    }
    for (const request of requestsData) {
      switch (request.status) {
        case AsrStatusEnum.Approved:
          return 'Approved';
        case AsrStatusEnum.ActionRequired:
          return 'Action Required';
        case AsrStatusEnum.Pending:
          return 'Pending';
        case AsrStatusEnum.InProgress:
          return 'In Progress';
      }
    }
    return 'None';
  }, [requestsData]);

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={0}
      showPercentage={false}
      steps={steps}
      currentIndex={currentIndex}
      icons={useIconPanelItems(isDrawerOpen, toggleDrawer)}
      sidebarTitle={t('Additional Salary Request')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Additional Salary Request Sections')}
      mainContent={
        <Container sx={{ ml: 5 }}>
          {requestsError ? (
            <Notification type="error" message={requestsError.message} />
          ) : !requestsData ? (
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

              {requestsData.map((request) => (
                <CurrentRequest key={request.id} request={request} />
              ))}
              <Button
                variant="contained"
                color="primary"
                onClick={() => createAdditionalSalaryRequest()}
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
