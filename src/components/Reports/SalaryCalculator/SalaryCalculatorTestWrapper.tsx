import { ThemeProvider } from '@emotion/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';

interface SalaryCalculatorTestWrapperProps {
  children?: React.ReactNode;
}

export const SalaryCalculatorTestWrapper: React.FC<
  SalaryCalculatorTestWrapperProps
> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>{children}</TestRouter>
  </ThemeProvider>
);
