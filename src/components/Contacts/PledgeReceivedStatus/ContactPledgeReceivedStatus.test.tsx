import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { ContactPledgeReceivedStatus } from './ContactPledgeReceivedStatus';

const TestComponent: React.FC<{ pledgeReceived: boolean }> = ({
  pledgeReceived,
}) => (
  <ThemeProvider theme={theme}>
    <ContactPledgeReceivedStatus pledgeReceived={pledgeReceived} />
  </ThemeProvider>
);

describe('PledgeReceivedStatus', () => {
  it('should render commitment received with success icon when pledgeReceived is true', () => {
    const { getByRole } = render(<TestComponent pledgeReceived={true} />);

    expect(
      getByRole('img', { name: 'Commitment Received' }),
    ).toBeInTheDocument();
    expect(getByRole('img', { name: 'Commitment Received' })).toHaveAttribute(
      'data-testid',
      'CheckCircleIcon',
    );
  });

  it('should render commitment not received with error icon when pledgeReceived is false', () => {
    const { getByRole } = render(<TestComponent pledgeReceived={false} />);

    expect(
      getByRole('img', { name: 'Commitment Not Received' }),
    ).toBeInTheDocument();
    expect(
      getByRole('img', { name: 'Commitment Not Received' }),
    ).toHaveAttribute('data-testid', 'ErrorIcon');
  });
});
