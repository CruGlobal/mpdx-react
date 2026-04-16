import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  SalaryRequestStatusEnum,
  SecaStatusEnum,
  UserTypeEnum,
} from 'src/graphql/types.generated';
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
        GetUser: GetUserQuery;
      }>
        mocks={{
          Hcm: {
            hcm: [
              {
                staffInfo: {
                  preferredName: 'John',
                  lastName: 'Doe',
                  secaStatus: SecaStatusEnum.Seca,
                },
                currentSalary: {
                  grossSalaryAmount: 55000,
                  lastUpdated: '2024-03-01',
                },
                fourOThreeB: {
                  currentRothContributionPercentage: 12,
                  currentTaxDeferredContributionPercentage: 5,
                },
                mhaRequest: {
                  currentTakenAmount: 10000,
                },
                salaryRequestEligible,
              },
              {
                staffInfo: {
                  preferredName: 'Jane',
                  lastName: 'Doe',
                  secaStatus: SecaStatusEnum.Seca,
                },
                currentSalary: {
                  grossSalaryAmount: 10000,
                  lastUpdated: '2024-03-01',
                },
                fourOThreeB: {
                  currentRothContributionPercentage: 10,
                  currentTaxDeferredContributionPercentage: 6,
                },
                mhaRequest: {
                  currentTakenAmount: 12000,
                },
                salaryRequestEligible,
              },
            ],
          },
          LandingSalaryCalculations: {
            inProgressCalculation: hasInProgressCalculation
              ? { id: 'in-progress-calc-1' }
              : null,
            effectiveCalculation: hasApprovedCalculation
              ? {
                  salary: 50000,
                  spouseSalary: 60000,
                  calculations: { effectiveCap: 60000 },
                  spouseCalculations: { effectiveCap: 70000 },
                }
              : null,
            latestCalculation: hasLatestCalculation
              ? {
                  id: 'pending-calc-1',
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
          GetUser: {
            user: {
              userType: UserTypeEnum.UsStaff,
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
