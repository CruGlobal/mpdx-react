import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { DonationsReportTable } from './DonationsReportTable';

describe('DonationsReportTable', () => {
  it('updates the time filter', () => {
    const setTime = jest.fn();
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={jest.fn()}>
          <DonationsReportTable
            accountListId={'abc'}
            time={DateTime.now()}
            setTime={setTime}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByRole('button', { name: 'Previous Month' }));
    expect(setTime.mock.lastCall[0].toISODate()).toBe('2019-12-01');
  });
});
