import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { merge } from 'lodash';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import {
  PayrollDate,
  SalaryRequestStatusEnum,
} from 'src/graphql/types.generated';
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
        salaryRequestEligible: true,
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
        mhaEit: {
          mhaEligibility: true,
        },
        exceptionSalaryCap: {
          boardCapException: false,
        },
      },
      {
        salaryRequestEligible: true,
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
        mhaEit: {
          mhaEligibility: true,
        },
        exceptionSalaryCap: {
          boardCapException: false,
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
  hcmUser?: DeepPartial<HcmQuery['hcm'][number]>;
  hcmSpouse?: DeepPartial<HcmQuery['hcm'][number]>;
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
  hasSpouse?: boolean;
  payrollDates?: PayrollDate[];
  editing?: boolean;
}

export const SalaryCalculatorTestWrapper: React.FC<
  SalaryCalculatorTestWrapperProps
> = ({
  salaryRequestMock,
  hcmUser,
  hcmSpouse,
  onCall,
  children,
  hasSpouse = true,
  payrollDates = [],
  editing = true,
}) => {
  const hcmUserMerged = hcmUser ? merge({}, hcmUserMock, hcmUser) : hcmUserMock;
  const hcmSpouseMerged = hcmSpouse
    ? merge({}, hcmSpouseMock, hcmSpouse)
    : hcmSpouseMock;
  return (
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{
          query: {
            accountListId: 'account-list-1',
            calculationId: 'salary-request-1',
            ...(editing ? {} : { mode: 'view' }),
          },
        }}
      >
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
              hcm: hasSpouse
                ? [hcmUserMerged, hcmSpouseMerged]
                : [hcmUserMerged],
            },
            SalaryCalculation: {
              salaryRequest: merge(
                {
                  id: 'salary-request-1',
                  status: SalaryRequestStatusEnum.InProgress,
                  effectiveDate: '2025-01-01',
                  calculations: {
                    hardCap: 80000,
                    exceptionCap: null,
                    combinedCap: 125000,
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
