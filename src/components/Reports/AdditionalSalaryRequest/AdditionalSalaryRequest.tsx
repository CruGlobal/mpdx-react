import React from 'react';
import { Button, Container, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Notification } from 'src/components/Notification/Notification';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { NameDisplay } from '../Shared/CalculationReports/NameDisplay/NameDisplay';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../Shared/CalculationReports/StepsList/StepsList';
import { AdditionalSalaryRequestSkeleton } from './AdditionalSalaryRequestSkeleton';
import { EligibleDisplay } from './MainPages/EligibleDisplay';
import { IneligibleDisplay } from './MainPages/IneligibleDisplay';
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
    hcmUser,
    hcmSpouse,
    isMarried,
    preferredName,
    spousePreferredName,
    createAdditionalSalaryRequest,
    previousApprovedRequest,
  } = useAdditionalSalaryRequest();

  const personNumber = hcmUser?.staffInfo?.personNumber ?? '';
  const spousePersonNumber = hcmSpouse?.staffInfo?.personNumber ?? '';
  const lastName = hcmUser?.staffInfo?.lastName ?? '';
  const spouseLastName = hcmSpouse?.staffInfo?.lastName ?? '';

  const names = isMarried
    ? `${preferredName} ${lastName} and ${spousePreferredName} ${spouseLastName}`
    : `${preferredName} ${lastName}`;
  const personNumbers = isMarried
    ? `${personNumber} and ${spousePersonNumber}`
    : personNumber;

  const currentRequest = requestsData[0] || {};
  // It default to true when no availableDate as the request is likely still being processed
  const isCurrentRequestPending = true;

  const hasNoRequests = !requestsData.length;

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
            <>
              <Stack direction="column" width={mainContentWidth}>
                {hasNoRequests ? (
                  <IneligibleDisplay />
                ) : (
                  <EligibleDisplay isPending={isCurrentRequestPending} />
                )}
                <NameDisplay names={names} personNumbers={personNumbers} />

                {currentRequest &&
                  (isCurrentRequestPending ? (
                    <CurrentRequest request={currentRequest} />
                  ) : (
                    <CurrentBoardApproved request={currentRequest} />
                  ))}
              </Stack>
              {(!isCurrentRequestPending || hasNoRequests) && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={createAdditionalSalaryRequest}
                >
                  {t('Request New MHA')}
                </Button>
              )}
            </>
          )}

          {previousApprovedRequest && (
            <Stack direction="column" width={mainContentWidth} mt={4}>
              <CurrentBoardApproved request={previousApprovedRequest} />
            </Stack>
          )}
        </Container>
      }
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
