import { ThemeProvider } from '@emotion/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { AdditionalSalaryRequestProvider } from './Shared/AdditionalSalaryRequestContext';

interface AdditionalSalaryRequestTestWrapperProps {
  children?: React.ReactNode;
}

export const AdditionalSalaryRequestTestWrapper: React.FC<
  AdditionalSalaryRequestTestWrapperProps
> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: {
          accountListId: 'account-list-1',
        },
      }}
    >
      <AdditionalSalaryRequestProvider>
        {children}
      </AdditionalSalaryRequestProvider>
    </TestRouter>
  </ThemeProvider>
);
