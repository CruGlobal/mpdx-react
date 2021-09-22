import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@material-ui/core';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { StatusEnum } from '../../../../../../graphql/types.generated';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  render,
  waitFor,
} from '../../../../../../__tests__/util/testingLibraryReactMock';
import theme from '../../../../../theme';
import {
  ContactDonorAccountsFragment,
  ContactDonorAccountsFragmentDoc,
} from '../ContactDonationsTab.generated';
import { PartnershipInfo } from './PartnershipInfo';

const mock = gqlMock<ContactDonorAccountsFragment>(
  ContactDonorAccountsFragmentDoc,
  {
    mocks: {
      status: StatusEnum.PartnerFinancial,
      nextAsk: DateTime.local().plus({ month: 3 }).toISO(),
      pledgeCurrency: 'CAD',
      pledgeStartDate: DateTime.local().toISO(),
      lastDonation: {
        donationDate: DateTime.local().toISO(),
        amount: {
          currency: 'CAD',
        },
      },
    },
  },
);

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

describe('PartnershipInfo', () => {
  it('test renderer', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <MockedProvider>
              <PartnershipInfo contact={mock} />
            </MockedProvider>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Partner - Financial')).toBeInTheDocument();
  });

  it('should open edit partnership information modal', () => {
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <MockedProvider>
              <PartnershipInfo contact={mock} />
            </MockedProvider>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Partner - Financial')).toBeInTheDocument();
    userEvent.click(getByLabelText('Edit Icon'));
    expect(getByText('Edit Partnership')).toBeInTheDocument();
  });

  it('should close edit partnership information modal', async () => {
    const { getByText, getByLabelText, queryByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <MockedProvider>
              <PartnershipInfo contact={mock} />
            </MockedProvider>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Partner - Financial')).toBeInTheDocument();
    userEvent.click(getByLabelText('Edit Icon'));
    expect(getByText('Edit Partnership')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Edit Partnership')).not.toBeInTheDocument(),
    );
  });
});
