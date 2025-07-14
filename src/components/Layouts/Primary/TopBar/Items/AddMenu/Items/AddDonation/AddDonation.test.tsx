import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetAppealsForMassActionQuery } from 'src/components/Contacts/MassActions/AddToAppeal/GetAppealsForMassAction.generated';
import { GetDesignationAccountsQuery } from 'src/components/EditDonationModal/EditDonationModal.generated';
import { GetDonorAccountsQuery } from 'src/components/common/Autocomplete/DonorAccountAutocomplete/DonorAccountAutocomplete.generated';
import theme from '../../../../../../../../theme';
import { AddDonation } from './AddDonation';
import { AddDonationMutation } from './AddDonation.generated';

const accountListId = '111';
const handleClose = jest.fn();

describe('AddDonation', () => {
  it('default', async () => {
    const { queryByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <GqlMockedProvider>
              <AddDonation
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </LocalizationProvider>,
    );
    await waitFor(() => expect(queryByText('Amount')).toBeInTheDocument());
  });

  it('closes add donation modal', async () => {
    const { queryByText, getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <GqlMockedProvider>
              <AddDonation
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </LocalizationProvider>,
    );
    await waitFor(() => expect(queryByText('Amount')).toBeInTheDocument());
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('Creates a donation', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, findByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <GqlMockedProvider<{
              GetAppealsForMassAction: GetAppealsForMassActionQuery;
              AddDonation: AddDonationMutation;
              GetDesignationAccounts: GetDesignationAccountsQuery;
              GetDonorAccounts: GetDonorAccountsQuery;
            }>
              onCall={mutationSpy}
              mocks={{
                GetAppealsForMassAction: {
                  appeals: {
                    nodes: [
                      {
                        id: 'appeal-1',
                        name: 'Cool appeal',
                        contactIds: ['contactIdOne', 'contactIdTwo'],
                      },
                    ],
                    pageInfo: {
                      hasNextPage: false,
                    },
                  },
                },
                GetDesignationAccounts: {
                  designationAccounts: [
                    {
                      designationAccounts: [
                        {
                          id: '321',
                          name: 'Cool Designation Account',
                          active: true,
                        },
                      ],
                    },
                  ],
                },
                GetDonorAccounts: {
                  accountListDonorAccounts: [
                    {
                      id: 'donor-acc-1',
                      name: 'Cool Donor Account',
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
        </ThemeProvider>
      </LocalizationProvider>,
    );

    const amountTextbox = await findByRole('textbox', { name: 'Amount' });
    userEvent.clear(amountTextbox);
    userEvent.type(amountTextbox, '500.50');
    expect(getByRole('combobox', { name: 'Currency' })).toBeInTheDocument();

    userEvent.type(getByRole('combobox', { name: 'Partner Account' }), 'Cool');
    userEvent.click(await findByRole('option', { name: 'Cool Donor Account' }));

    userEvent.type(
      getByRole('combobox', { name: 'Designation Account' }),
      'Cool',
    );
    userEvent.click(
      await findByRole('option', { name: 'Cool Designation Account (321)' }),
    );

    userEvent.type(getByRole('combobox', { name: 'Appeal' }), 'Cool');
    userEvent.click(await findByRole('option', { name: 'Cool appeal' }));

    userEvent.type(getByRole('textbox', { name: 'Memo' }), 'cool memo');

    await waitFor(() =>
      expect(getByRole('button', { name: 'Save' })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddDonation', {
        accountListId,
        attributes: {
          amount: 500.5,
          appealAmount: null,
          appealId: 'appeal-1',
          designationAccountId: '321',
          donationDate: '2020-01-01',
          donorAccountId: 'donor-acc-1',
          memo: 'cool memo',
        },
      }),
    );
  }, 20000);

  it('auto fills designation account when there is only one option', async () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <GqlMockedProvider<{
              GetDesignationAccounts: GetDesignationAccountsQuery;
            }>
              mocks={{
                GetDesignationAccounts: {
                  designationAccounts: [
                    {
                      designationAccounts: [
                        {
                          id: '321',
                          name: 'Cool Designation Account',
                        },
                      ],
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
        </ThemeProvider>
      </LocalizationProvider>,
    );

    await waitFor(() =>
      expect(
        getByRole('combobox', { name: 'Designation Account' }),
      ).toHaveValue('Cool Designation Account (321)'),
    );
  });
});
