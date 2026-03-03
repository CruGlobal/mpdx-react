import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { IneligibleDisplay } from './IneligibleDisplay';

interface TestComponentProps {
  contextValue: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <MinisterHousingAllowanceContext.Provider
          value={contextValue as ContextType}
        >
          <IneligibleDisplay />
        </MinisterHousingAllowanceContext.Provider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

describe('IneligibleDisplay', () => {
  it('should render single user ineligible message', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: false,
          spouseEligibleForMHA: false,
        }}
      />,
    );

    expect(getByTestId('single-ineligible')).toBeInTheDocument();
  });

  it('should render both ineligible message when neither user is eligible', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: false,
          spouseEligibleForMHA: false,
        }}
      />,
    );

    expect(getByTestId('both-ineligible')).toBeInTheDocument();
  });

  it('should render user ineligible message when user ineligible', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: false,
          spouseEligibleForMHA: true,
        }}
      />,
    );

    expect(getByTestId('one-ineligible')).toBeInTheDocument();
  });

  it('should render spouse ineligible message when spouse ineligible', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: true,
          spouseEligibleForMHA: false,
        }}
      />,
    );

    expect(getByTestId('one-ineligible')).toBeInTheDocument();
  });
});
