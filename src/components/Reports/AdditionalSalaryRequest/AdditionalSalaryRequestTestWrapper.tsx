import { ThemeProvider } from '@emotion/react';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { CompleteFormValues } from './AdditionalSalaryRequest';
import { AdditionalSalaryRequestProvider } from './Shared/AdditionalSalaryRequestContext';

interface AdditionalSalaryRequestTestWrapperProps {
  children?: React.ReactNode;
  initialValues?: CompleteFormValues;
}

export const AdditionalSalaryRequestTestWrapper: React.FC<
  AdditionalSalaryRequestTestWrapperProps
> = ({ children, initialValues }) => (
  <ThemeProvider theme={theme}>
    <I18nextProvider i18n={i18n}>
      <TestRouter
        router={{
          query: {
            accountListId: 'account-list-1',
          },
        }}
      >
        <GqlMockedProvider>
          <AdditionalSalaryRequestProvider initialValues={initialValues}>
            {children}
          </AdditionalSalaryRequestProvider>
        </GqlMockedProvider>
      </TestRouter>
    </I18nextProvider>
  </ThemeProvider>
);
