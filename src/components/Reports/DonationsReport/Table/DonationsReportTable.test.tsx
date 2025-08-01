import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { DonationsReportTable } from './DonationsReportTable';

describe('DonationsReportTable', () => {
  it('updates the time filter', () => {
    const setTime = jest.fn();
    const { getByRole } = render(
      <TestRouter>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider onCall={jest.fn()}>
            <ContactPanelProvider>
              <DonationsReportTable
                accountListId={'abc'}
                time={DateTime.now()}
                setTime={setTime}
              />
            </ContactPanelProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    userEvent.click(getByRole('button', { name: 'Previous Month' }));
    expect(setTime.mock.lastCall[0].toISODate()).toBe('2019-12-01');
  });
});
