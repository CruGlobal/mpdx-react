import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { defaultsDeep } from 'lodash';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PayrollDate } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { PayrollDatesQuery } from './EffectiveDateStep/PayrollDates.generated';
import { HcmQuery } from './SalaryCalculatorContext/Hcm.generated';
import { SalaryCalculationQuery } from './SalaryCalculatorContext/SalaryCalculation.generated';
import { SalaryCalculatorProvider } from './SalaryCalculatorContext/SalaryCalculatorContext';

export interface SalaryCalculatorTestWrapperProps {
  salaryRequestMock?: DeepPartial<SalaryCalculationQuery['salaryRequest']>;
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
  hasSpouse?: boolean;
  payrollDates?: PayrollDate[];
}

export const SalaryCalculatorTestWrapper: React.FC<
  SalaryCalculatorTestWrapperProps
> = ({
  salaryRequestMock,
  onCall,
  children,
  hasSpouse = true,
  payrollDates,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        Hcm: HcmQuery;
        PayrollDates: PayrollDatesQuery;
        SalaryCalculation: SalaryCalculationQuery;
      }>
        mocks={{
          PayrollDates: {
            payrollDates: payrollDates || [],
          },
          Hcm: {
            hcm: [
              {
                staffInfo: {
                  firstName: 'John',
                  lastName: 'Doe',
                  city: 'Tampa',
                  state: 'FL',
                  tenure: 4,
                  age: 34,
                  dependentChildrenWithHealthcareBenefits: 2,
                },
                fourOThreeB: {
                  currentRothContributionPercentage: 12,
                  currentTaxDeferredContributionPercentage: 5,
                  maximumContributionLimit: 45,
                },
                mhaRequest: {
                  currentApprovedOverallAmount: 10000,
                  currentApprovedAmountForStaff: 500,
                },
                exceptionSalaryCap: {
                  amount: null,
                },
              },
              ...(hasSpouse
                ? [
                    {
                      staffInfo: {
                        firstName: 'Jane',
                        lastName: 'Doe',
                        tenure: 1000,
                      },
                      fourOThreeB: {
                        currentRothContributionPercentage: 10,
                        currentTaxDeferredContributionPercentage: 8,
                        maximumContributionLimit: 47,
                      },
                      mhaRequest: {
                        currentApprovedOverallAmount: 12000,
                        currentApprovedAmountForStaff: 800,
                      },
                    },
                  ]
                : []),
            ],
          },
          SalaryCalculation: {
            salaryRequest: defaultsDeep(salaryRequestMock ?? {}, {
              calculations: {
                individualCap: 80000,
                familyCap: 125000,
                hardCap: 80000,
              },
            }),
          },
        }}
        onCall={onCall}
      >
        <SalaryCalculatorProvider>{children}</SalaryCalculatorProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);
