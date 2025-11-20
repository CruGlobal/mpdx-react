import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { HcmQuery } from './SalaryCalculatorContext/Hcm.generated';
import { SalaryCalculatorProvider } from './SalaryCalculatorContext/SalaryCalculatorContext';

interface SalaryCalculatorTestWrapperProps {
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
}

export const SalaryCalculatorTestWrapper: React.FC<
  SalaryCalculatorTestWrapperProps
> = ({ onCall, children }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        Hcm: HcmQuery;
      }>
        mocks={{
          Hcm: {
            hcm: [
              {
                fourOThreeB: {
                  currentRothContributionPercentage: 12,
                  currentTaxDeferredContributionPercentage: 5,
                  maximumContributionLimit: 45,
                },
              },
              {
                fourOThreeB: {
                  currentRothContributionPercentage: 10,
                  currentTaxDeferredContributionPercentage: 8,
                  maximumContributionLimit: 47,
                },
              },
            ],
          },
        }}
        onCall={onCall}
      >
        <SalaryCalculatorProvider>{children}</SalaryCalculatorProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);
