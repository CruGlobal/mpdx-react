import { Container, Stack } from '@mui/material';
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
import { ApprovedRequest } from './SharedComponents/ApprovedRequest';
import { CurrentRequest } from './SharedComponents/CurrentRequest';

export const mainContentWidth = theme.spacing(85);

export interface CompleteFormValues {
  currentYearSalaryNotReceived: string;
  previousYearSalaryNotReceived: string;
  additionalSalaryWithinMax: string;
  adoption: string;
  traditional403bContribution: string;
  roth403bContribution: string;
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
  deductTaxDeferredPercent: boolean;
  deductRothPercent: boolean;
  phoneNumber: string;
  totalAdditionalSalaryRequested: string;
  additionalInfo: string;
  emailAddress: string;
}

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const {
    isDrawerOpen,
    toggleDrawer,
    steps,
    currentIndex,
    requestError,
    requestData,
    loading: requestLoading,
  } = useAdditionalSalaryRequest();

  const request = requestData?.latestAdditionalSalaryRequest;

  const iconPanelItems = useIconPanelItems(isDrawerOpen, toggleDrawer);
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
              <EligibleDisplay />

              {request &&
                (request.status === AsrStatusEnum.Approved ? (
                  <ApprovedRequest request={request} />
                ) : (
                  <CurrentRequest request={request} />
                ))}
            </Stack>
          )}
        </Container>
      }
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
