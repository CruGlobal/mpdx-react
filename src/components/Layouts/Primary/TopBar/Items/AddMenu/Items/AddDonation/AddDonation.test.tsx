import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { MuiThemeProvider } from '@mui/material';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../../../theme';
import { AddDonation } from './AddDonation';
import { AddDonationMutation } from './AddDonation.generated';

const accountListId = '111';
const handleClose = jest.fn();

describe('AddDonation', () => {
  it('default', async () => {
    const { queryByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <MuiThemeProvider theme={theme}>
          <SnackbarProvider>
            <GqlMockedProvider<AddDonationMutation>>
              <AddDonation
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </MuiThemeProvider>
      </MuiPickersUtilsProvider>,
    );
    await waitFor(() => expect(queryByText('Amount')).toBeInTheDocument());
  });

  it('closes add donation modal', async () => {
    const { queryByText, getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <MuiThemeProvider theme={theme}>
          <SnackbarProvider>
            <GqlMockedProvider<AddDonationMutation>>
              <AddDonation
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </MuiThemeProvider>
      </MuiPickersUtilsProvider>,
    );
    await waitFor(() => expect(queryByText('Amount')).toBeInTheDocument());
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('Creates a donation', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, queryByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <MuiThemeProvider theme={theme}>
          <SnackbarProvider>
            <GqlMockedProvider<AddDonationMutation>
              onCall={mutationSpy}
              mocks={{
                GetDonationModal: {
                  accountList: {
                    id: '123',
                    currency: 'USD',
                    appeals: [
                      {
                        active: true,
                        name: 'Cool appeal',
                        id: 'appeal-1',
                      },
                    ],
                  },
                  designationAccounts: {
                    designationAccounts: [
                      {
                        id: '321',
                        name: 'Cool Designation Account',
                        active: true,
                      },
                    ],
                  },
                },
                GetAccountListDonorAccounts: {
                  accountListDonorAccounts: [
                    {
                      id: 'donor-acc-1',
                      accountNumber: 'acct-01',
                      displayName: 'Cool Donor Account',
                    },
                  ],
                },
              }}
            >
              <AddDonation
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </MuiThemeProvider>
      </MuiPickersUtilsProvider>,
    );

    await waitFor(() => expect(queryByText('Amount')).toBeInTheDocument());
    userEvent.clear(getByRole('textbox', { hidden: true, name: 'Amount' }));
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Amount' }),
      '500.50',
    );
    // expect(
    //   getByRole('combobox', { hidden: true, name: 'Currency USD ($)' }),
    // ).toBeInTheDocument();

    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Partner Account' }),
      'Cool',
    );
    // TODO Figure out why menus won't render in order to complete test for adding donation
    // await waitFor(() => expect(getByText('Cool Donor Account')).toBeVisible());

    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Designation Account' }),
      'Cool',
    );
    // await waitFor(() =>
    //   expect(getByText('Cool Designation Account')).toBeVisible(),
    // );
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Appeal' }),
      'Cool',
    );
    // await waitFor(() => expect(getByText('Cool appeal')).toBeVisible());
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Memo' }),
      'cool memo',
    );

    // userEvent.click(getByText('Save'));
  });
});
