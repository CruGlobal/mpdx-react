import React from 'react';
import { Button, Container, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Notification } from 'src/components/Notification/Notification';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../Shared/CalculationReports/StepsList/StepsList';
import { AdditionalSalaryRequestSkeleton } from './AdditionalSalaryRequestSkeleton';
import { EligibleDisplay } from './MainPages/EligibleDisplay';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';
import { CurrentBoardApproved } from './SharedComponents/CurrentBoardApproved';
import { CurrentRequest } from './SharedComponents/CurrentRequest';

export const mainContentWidth = theme.spacing(85);

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
  telephoneNumber: string;
}

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const {
    isDrawerOpen,
    toggleDrawer,
    steps,
    currentIndex,
    percentComplete,
    requestsError,
    requestsData,
    createAdditionalSalaryRequest,
  } = useAdditionalSalaryRequest();

  // It default to true when no availableDate as the request is likely still being processed
  const isAnyRequestPending =
    requestsData?.some((request) => request.status === AsrStatusEnum.Pending) ??
    false;

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
              <EligibleDisplay isAnyRequestPending={isAnyRequestPending} />

              {requestsData.map((request) =>
                request.status === AsrStatusEnum.Approved ? (
                  <CurrentBoardApproved request={request} />
                ) : (
                  <CurrentRequest request={request} />
                ),
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={() => createAdditionalSalaryRequest()}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('Request New ASR')}
              </Button>
            </Stack>
          )}
        </Container>
      }
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
