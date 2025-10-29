import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { CurrentRequest } from './CurrentRequest';

const TestComponent: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CurrentRequest
        approvedOverallAmount={1500}
        requestedDate={'2023-08-23'}
        deadlineDate={'2023-09-17'}
        boardApprovedDate={'2023-10-01'}
        availableDate={'2024-01-01'}
      />
    </ThemeProvider>
  );
};

//TODO: Update tests when real mha status logic is implemented

describe('CurrentRequest Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Current Board Approved MHA')).toBeInTheDocument();
    expect(getByText('View Request')).toBeInTheDocument();
    expect(getByText('Edit Request')).toBeInTheDocument();

    expect(getByText('$1,500.00')).toBeInTheDocument();

    expect(getByText(/Requested on: 8\/23\/2023/i)).toBeInTheDocument();
    expect(getByText(/Deadline for changes: 9\/17\/2023/i)).toBeInTheDocument();
    expect(getByText(/Board Approval on: 10\/1\/2023/i)).toBeInTheDocument();
    expect(getByText(/MHA Available on: 1\/1\/2024/i)).toBeInTheDocument();
  });
});
