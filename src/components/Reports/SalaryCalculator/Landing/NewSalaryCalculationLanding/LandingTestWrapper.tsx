import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { HcmQuery } from '../../SalaryCalculatorContext/Hcm.generated';
import { AccountBalanceQuery } from '../AccountBalance.generated';
import { StaffAccountIdQuery } from '../StaffAccountId.generated';
import { LandingSalaryCalculationsQuery } from './LandingSalaryCalculations.generated';

interface LandingTestWrapperProps {
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
  hasInProgressCalculation?: boolean;
  hasApprovedCalculation?: boolean;
  hasLatestCalculation?: boolean;
  salaryRequestEligible?: boolean;
}

export const LandingTestWrapper: React.FC<LandingTestWrapperProps> = ({
  onCall,
  children,
  hasInProgressCalculation = false,
  hasApprovedCalculation = false,
  hasLatestCalculation = false,
  salaryRequestEligible = true,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        Hcm: HcmQuery;
        StaffAccountId: StaffAccountIdQuery;
        AccountBalance: AccountBalanceQuery;
        LandingSalaryCalculations: LandingSalaryCalculationsQuery;
      }>
        mocks={{
          Hcm: {
            hcm: [
              {
                staffInfo: {
                  preferredName: 'John',
                  lastName: 'Doe',
                },
                currentSalary: {
                  grossSalaryAmount: 55000,
                  lastUpdated: '2024-03-01',
                },
                fourOThreeB: {
                  currentRothContributionPercentage: 12,
                  currentTaxDeferredContributionPercentage: 5,
                  maximumContributionLimit: 45,
                },
                salaryRequestEligible,
              },
              {
                staffInfo: {
                  preferredName: 'Jane',
                  lastName: 'Doe',
                },
                currentSalary: {
                  grossSalaryAmount: 10000,
                  lastUpdated: '2024-03-01',
                },
                fourOThreeB: {
                  currentRothContributionPercentage: 10,
                  currentTaxDeferredContributionPercentage: 6,
                  maximumContributionLimit: 45,
                },
              },
            ],
          },
          LandingSalaryCalculations: {
            inProgressCalculation: hasInProgressCalculation ? {} : null,
            approvedCalculation: hasApprovedCalculation ? {} : null,
            latestCalculation: hasLatestCalculation
              ? {
                  id: 'pending-calc-1',
                  effectiveDate: '2025-02-01',
                  status: SalaryRequestStatusEnum.Pending,
                  submittedAt: '2025-01-16T10:00:00Z',
                  changesRequestedAt: null,
                  feedback: null,
                }
              : null,
          },
          StaffAccountId: {
            user: {
              staffAccountId: '111111111',
            },
          },
          AccountBalance: {
            reportsStaffExpenses: {
              funds: [{ total: 10000 }],
            },
          },
        }}
        onCall={onCall}
      >
        {children as React.ReactElement}
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);
