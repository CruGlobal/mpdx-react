import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { merge } from 'lodash';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { PayrollDate } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { PayrollDatesQuery } from './EffectiveDateStep/PayrollDates.generated';
import {
  HcmDocument,
  HcmQuery,
  HcmQueryVariables,
} from './SalaryCalculatorContext/Hcm.generated';
import { SalaryCalculationQuery } from './SalaryCalculatorContext/SalaryCalculation.generated';
import { SalaryCalculatorProvider } from './SalaryCalculatorContext/SalaryCalculatorContext';

const hcmMock = gqlMock<HcmQuery, HcmQueryVariables>(HcmDocument, {
  mocks: {
    hcm: [
      {
        staffInfo: {
          preferredName: 'John',
          lastName: 'Doe',
          city: 'Miami',
          state: 'FL',
          tenure: 4,
          age: 34,
          dependentChildrenWithHealthcareBenefits: 2,
          primaryPhoneNumber: '555-0123',
          emailAddress: 'john.doe@example.com',
        },
        fourOThreeB: {
          currentRothContributionPercentage: 12,
          currentTaxDeferredContributionPercentage: 5,
          maximumContributionLimit: 45,
        },
        mhaRequest: {
          currentApprovedOverallAmount: 20000,
          currentTakenAmount: 300,
        },
        exceptionSalaryCap: {
          amount: null,
        },
      },
      {
        staffInfo: {
          preferredName: 'Jane',
          lastName: 'Doe',
          tenure: 1000,
          primaryPhoneNumber: '555-0124',
          emailAddress: 'jane.doe@example.com',
        },
        fourOThreeB: {
          currentRothContributionPercentage: 10,
          currentTaxDeferredContributionPercentage: 8,
          maximumContributionLimit: 47,
        },
        mhaRequest: {
          currentApprovedOverallAmount: 20000,
          currentTakenAmount: 500,
        },
        exceptionSalaryCap: {
          amount: null,
        },
      },
    ],
  },
}).hcm;
export const hcmUserMock = hcmMock[0];
export const hcmSpouseMock = hcmMock[1];

export type SalaryRequestMock = DeepPartial<
  SalaryCalculationQuery['salaryRequest']
>;

export interface SalaryCalculatorTestWrapperProps {
  salaryRequestMock?: SalaryRequestMock;
  hcmMock?: DeepPartial<HcmQuery['hcm'][number]>;
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
  hasSpouse?: boolean;
  payrollDates?: PayrollDate[];
}

export const SalaryCalculatorTestWrapper: React.FC<
  SalaryCalculatorTestWrapperProps
> = ({
  salaryRequestMock,
  hcmMock,
  onCall,
  children,
  hasSpouse = true,
  payrollDates = [],
}) => {
  const hcmUser = merge(hcmUserMock, hcmMock);
  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider<{
          Hcm: HcmQuery;
          PayrollDates: PayrollDatesQuery;
          SalaryCalculation: SalaryCalculationQuery;
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
        }>
          mocks={{
            PayrollDates: {
              payrollDates,
            },
            GoalCalculatorConstants: {
              constant: {
                mpdGoalGeographicConstants: [
                  { location: 'Atlanta, GA' },
                  { location: 'Miami, FL' },
                ],
              },
            },
            Hcm: {
              hcm: hasSpouse ? [hcmUser, hcmSpouseMock] : [hcmUser],
            },
            SalaryCalculation: {
              salaryRequest: merge(
                {
                  id: 'salary-request-1',
                  calculations: {
                    individualCap: 80000,
                    familyCap: 125000,
                    hardCap: 80000,
                  },
                  progressiveApprovalTier: null,
                } satisfies SalaryRequestMock,
                salaryRequestMock,
                hasSpouse ? undefined : { spouseCalculations: null },
              ) as NonNullable<SalaryRequestMock>,
            },
          }}
          onCall={onCall}
        >
          <SalaryCalculatorProvider>{children}</SalaryCalculatorProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};
