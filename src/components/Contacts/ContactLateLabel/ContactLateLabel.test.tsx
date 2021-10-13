import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import theme from '../../../theme';
import { ContactLateLabel } from './ContactLateLabel';

const futureDate = DateTime.now().plus({ days: 3 }).toISO();
const PastDate = DateTime.now().minus({ days: 3 }).toISO();

describe('ContactLateLabel', () => {
  it('late', async () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateLabel lateAt={futureDate} />
      </MuiThemeProvider>,
    );

    expect(getByText('(On time)')).toBeInTheDocument();
  });

  it('on time', async () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateLabel lateAt={PastDate} />
      </MuiThemeProvider>,
    );

    expect(getByText('days late')).toBeInTheDocument();
  });
});
