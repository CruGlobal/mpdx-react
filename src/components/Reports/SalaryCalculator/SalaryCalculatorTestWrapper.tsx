import { ThemeProvider } from '@emotion/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { SalaryCalculatorProvider } from './SalaryCalculatorContext/SalaryCalculatorContext';

interface SalaryCalculatorTestWrapperProps {
  children?: React.ReactNode;
}

export const SalaryCalculatorTestWrapper: React.FC<
  SalaryCalculatorTestWrapperProps
> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <SalaryCalculatorProvider>{children}</SalaryCalculatorProvider>
    </TestRouter>
  </ThemeProvider>
);
