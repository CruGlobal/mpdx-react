import React from 'react';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';
import { GiftStatus } from './GiftStatus';

describe('GiftStatus', () => {
  it('is Late', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <GiftStatus lateAt={DateTime.now().minus({ day: 1 }).toISO()} />
      </ThemeProvider>,
    );
    expect(
      getByRole('img', {
        name: 'Late',
      }),
    ).toBeVisible();
  });
  it('is On Time', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <GiftStatus lateAt={DateTime.now().toISO()} />
      </ThemeProvider>,
    );
    expect(
      getByRole('img', {
        name: 'On Time',
      }),
    ).toBeVisible();
  });
});
