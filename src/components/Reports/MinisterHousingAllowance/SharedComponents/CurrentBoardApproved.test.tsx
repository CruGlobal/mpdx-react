import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { CurrentBoardApproved } from './CurrentBoardApproved';

const name = 'Doe, John';
const spouseName = 'Doe, Jane';

const TestComponent: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <CurrentBoardApproved
          approvedDate={'2023-01-15'}
          approvedOverallAmount={1500}
          staffName={name}
          staffSpecific={1000}
          spouseName={spouseName}
          spouseSpecific={500}
        />
      </TestRouter>
    </ThemeProvider>
  );
};

describe('CurrentBoardApproved Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Current Board Approved MHA')).toBeInTheDocument();
    expect(getByText('APPROVAL DATE: 1/15/2023')).toBeInTheDocument();
    expect(getByText('CURRENT MHA CLAIMED')).toBeInTheDocument();

    expect(getByText('$1,500.00')).toBeInTheDocument();
    expect(getByText('JOHN')).toBeInTheDocument();
    expect(getByText('$1,000.00')).toBeInTheDocument();
    expect(getByText('JANE')).toBeInTheDocument();
    expect(getByText('$500.00')).toBeInTheDocument();
  });
});
