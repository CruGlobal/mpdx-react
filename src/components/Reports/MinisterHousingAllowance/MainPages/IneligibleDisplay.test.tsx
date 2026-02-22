import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import {
  ContextType,
  HcmData,
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
  it('should render page with single staff', () => {
    const { getByText, queryByText } = render(
      <TestComponent
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: null,
        }}
      />,
    );

    expect(getByText('Your MHA')).toBeInTheDocument();
    expect(
      getByText(
        /our records indicate that you have not applied for minister's housing allowance/i,
      ),
    ).toBeInTheDocument();
    expect(
      queryByText(/Jane has not completed the required ibs courses/i),
    ).not.toBeInTheDocument();
  });

  it('should render page with married staff and ineligible spouse', () => {
    const { getByText } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: {
            staffInfo: {
              personNumber: '100123456',
            },
            mhaEit: {
              mhaEligibility: false,
            },
          } as unknown as HcmData,
        }}
      />,
    );

    expect(
      getByText(/Jane has not completed the required ibs courses/i),
    ).toBeInTheDocument();
  });

  it('should not show ineligible message when spouse is eligible', () => {
    const { queryByText } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: {
            staffInfo: {
              personNumber: '100123456',
            },
            mhaEit: {
              mhaEligibility: true,
            },
          } as unknown as HcmData,
        }}
      />,
    );

    expect(
      queryByText(/Jane has not completed the required ibs courses/i),
    ).not.toBeInTheDocument();
  });

  it('should show ineligible message when spouse HCM data has no mhaEit', () => {
    const { getByText } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: {
            staffInfo: {
              personNumber: '100123456',
            },
          } as unknown as HcmData,
        }}
      />,
    );

    expect(
      getByText(/Jane has not completed the required ibs courses/i),
    ).toBeInTheDocument();
  });
});
