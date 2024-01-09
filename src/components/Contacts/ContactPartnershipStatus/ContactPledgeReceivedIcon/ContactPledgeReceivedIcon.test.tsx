import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from '../../../../theme';
import { ContactPledgeReceivedIcon } from './ContactPledgeReceivedIcon';

describe('ContactPledgeReceivedIcon', () => {
  it('should display commitment received icon', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactPledgeReceivedIcon pledgeReceived={true} />
      </ThemeProvider>,
    );
    expect(
      getByRole('img', {
        name: 'Commitment Received',
      }),
    ).toBeVisible();
  });

  it('should display commitment not received icon', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactPledgeReceivedIcon pledgeReceived={false} />
      </ThemeProvider>,
    );
    expect(
      getByRole('img', {
        name: 'Commitment Not Received',
      }),
    ).toBeVisible();
  });
});
