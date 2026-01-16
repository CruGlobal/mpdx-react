import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  ContextType,
  HcmData,
  MinisterHousingAllowanceContext,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { mockMHARequest } from '../mockData';
import { CurrentBoardApproved } from './CurrentBoardApproved';

interface TestComponentProps {
  contextValue: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => {
  const approvedMHARequest = {
    ...mockMHARequest,
    requestAttributes: {
      ...mockMHARequest.requestAttributes,
      hrApprovedAt: '2023-01-15',
      approvedOverallAmount: 1500,
      staffSpecific: 1000,
      spouseSpecific: 500,
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider>
          <MinisterHousingAllowanceContext.Provider
            value={contextValue as ContextType}
          >
            <CurrentBoardApproved request={approvedMHARequest} />
          </MinisterHousingAllowanceContext.Provider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('CurrentBoardApproved Component', () => {
  it('should render correctly for married person', () => {
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

    expect(getByText('Current Board Approved MHA')).toBeInTheDocument();
    expect(getByText(/APPROVAL DATE/i)).toBeInTheDocument();
    expect(getByText(/1\/15\/2023/i)).toBeInTheDocument();
    expect(getByText('CURRENT MHA CLAIMED')).toBeInTheDocument();

    expect(getByText('$1,500.00')).toBeInTheDocument();
    expect(getByText('John')).toBeInTheDocument();
    expect(getByText('$1,000.00')).toBeInTheDocument();
    expect(getByText('Jane')).toBeInTheDocument();
    expect(getByText('$500.00')).toBeInTheDocument();
  });

  it('should render correctly for single person', () => {
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

    expect(getByText('Current Board Approved MHA')).toBeInTheDocument();
    expect(getByText(/APPROVAL DATE/i)).toBeInTheDocument();
    expect(getByText('CURRENT MHA CLAIMED')).toBeInTheDocument();

    expect(getByText('$1,500.00')).toBeInTheDocument();
    expect(getByText('John')).toBeInTheDocument();
    expect(getByText('$1,000.00')).toBeInTheDocument();

    // Spouse data should not be rendered
    expect(queryByText('Jane')).not.toBeInTheDocument();
  });
});
