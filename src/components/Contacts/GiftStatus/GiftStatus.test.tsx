import React from 'react';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';
import { GiftStatus } from './GiftStatus';

describe('GiftStatus', () => {
  it('is Late', () => {
    const { getByTitle } = render(
      <ThemeProvider theme={theme}>
        <GiftStatus lateAt={DateTime.now().minus({ day: 1 }).toISO()} />
      </ThemeProvider>,
    );
    expect(getByTitle('Late')).toBeVisible();
  });
  it('is On Time', () => {
    const { getByTitle } = render(
      <ThemeProvider theme={theme}>
        <GiftStatus lateAt={DateTime.now().toISO()} />
      </ThemeProvider>,
    );
    expect(getByTitle('On Time')).toBeVisible();
  });
  it('is hidden', () => {
    const { queryByTitle } = render(
      <ThemeProvider theme={theme}>
        <GiftStatus lateAt={undefined} />
      </ThemeProvider>,
    );
    expect(queryByTitle('On Time')).toBeNull();
    expect(queryByTitle('Late')).toBeNull();
  });
});
