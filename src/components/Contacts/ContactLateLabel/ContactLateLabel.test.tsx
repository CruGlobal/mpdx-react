import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import React from 'react';
import theme from '../../../theme';
import { ContactLateLabel } from './ContactLateLabel';

describe('ContactLateLabel', () => {
  it('late', async () => {
    const lateAt = '2021-10-22T21:38:00';

    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateLabel lateAt={lateAt} />
      </MuiThemeProvider>,
    );

    expect(getByText('days late')).toBeInTheDocument();
  });

  it('on time', async () => {
    const lateAt = '2021-8-22T21:38:00';

    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateLabel lateAt={lateAt} />
      </MuiThemeProvider>,
    );

    expect(getByText('On time')).toBeInTheDocument();
  });
});
