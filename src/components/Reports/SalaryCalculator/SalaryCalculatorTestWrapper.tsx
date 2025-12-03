import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  AssignmentCategoryEnum,
  PeopleGroupSupportTypeEnum,
  SalaryRequestStatusEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffAccountQuery } from '../StaffAccount.generated';
import { AccountBalanceQuery } from './Landing/AccountBalance.generated';
import { HcmQuery } from './SalaryCalculatorContext/Hcm.generated';
import { SalaryCalculationQuery } from './SalaryCalculatorContext/SalaryCalculation.generated';
import { SalaryCalculatorProvider } from './SalaryCalculatorContext/SalaryCalculatorContext';

interface SalaryCalculatorTestWrapperProps {
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
  assignmentCategory?: AssignmentCategoryEnum;
  peopleGroupSupportType?: PeopleGroupSupportTypeEnum;
}

export const SalaryCalculatorTestWrapper: React.FC<
  SalaryCalculatorTestWrapperProps
> = ({ onCall, children, assignmentCategory, peopleGroupSupportType }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        Hcm: HcmQuery;
        StaffAccount: StaffAccountQuery;
        AccountBalance: AccountBalanceQuery;
        SalaryCalculation: SalaryCalculationQuery;
      }>
        mocks={{
          Hcm: {
            hcm: [
              {
                staffInfo: {
                  firstName: 'John',
                  lastName: 'Doe',
                  assignmentCategory:
                    assignmentCategory ??
                    AssignmentCategoryEnum.FullTimeRegular,
                  peopleGroupSupportType:
                    peopleGroupSupportType ??
                    PeopleGroupSupportTypeEnum.SupportedRmo,
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
              },
              {
                staffInfo: {
                  firstName: 'Jane',
                  lastName: 'Doe',
                },
              },
            ],
          },
          SalaryCalculation: {
            salaryRequest: {
              status: SalaryRequestStatusEnum.InProgress,
              salaryCap: 80000,
              mhaAmount: 18000,
            },
          },
          StaffAccount: {
            staffAccount: {
              id: 'staff-123',
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
        <SalaryCalculatorProvider>{children}</SalaryCalculatorProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);
