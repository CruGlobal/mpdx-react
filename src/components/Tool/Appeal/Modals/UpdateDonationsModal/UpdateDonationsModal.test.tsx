import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { GetContactDonationsQuery } from 'src/components/Contacts/ContactDetails/ContactDonationsTab/ContactDonationsTab.generated';
import {
  AccountListCurrencyQuery,
  DonationTableQuery,
} from 'src/components/DonationTable/DonationTable.generated';
import { PledgeStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import {
  contactNoDonationsMock,
  contactWithDonationsMock,
  defaultContact,
} from './DeleteAppealContactModalMocks';
import { UpdateDonationsModal } from './UpdateDonationsModal';

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const accountListId = 'accountListId';
const appealId = 'appealId';

const defaultPledge = {
  id: 'pledgeId',
  amount: 110,
  amountCurrency: 'USD',
  appeal: {
    id: appealId,
  },
  expectedDate: '2024-08-08',
  status: PledgeStatusEnum.NotReceived,
};
const router = {
  query: { accountListId },
  isReady: true,
};
const handleClose = jest.fn();
const mutationSpy = jest.fn();

interface ComponentsProps {
  pledge?: AppealContactInfoFragment['pledges'][0] | null;
  isEmpty?: boolean;
  hasForeignCurrency?: boolean;
  hasMultiplePages?: boolean;
  zeroAmount?: boolean;
  noDonationsMatchAppeal?: boolean;
  mutationsThrowErrors?: boolean;
}

const Components = ({
  pledge = defaultPledge,
  isEmpty = false,
  hasForeignCurrency = false,
  hasMultiplePages = false,
  zeroAmount = false,
  noDonationsMatchAppeal = false,
  mutationsThrowErrors = false,
}: ComponentsProps) => {
  return (
    <I18nextProvider i18n={i18n}>
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <ThemeProvider theme={theme}>
              <TestRouter router={router}>
                <GqlMockedProvider<{
                  AccountListCurrency: AccountListCurrencyQuery;
                  GetContactDonations: GetContactDonationsQuery;
                  DonationTable: DonationTableQuery;
                }>
                  mocks={{
                    UpdateDonations: mutationsThrowErrors
                      ? () => {
                          throw new Error('Server Error');
                        }
                      : {},
                    UpdateAccountListPledge: mutationsThrowErrors
                      ? () => {
                          throw new Error('Server Error');
                        }
                      : {},
                    CreateAccountListPledge: mutationsThrowErrors
                      ? () => {
                          throw new Error('Server Error');
                        }
                      : {},
                    AccountListCurrency: {
                      accountList: {
                        currency: 'CAD',
                      },
                    },
                    GetContactDonations: isEmpty
                      ? contactNoDonationsMock
                      : contactWithDonationsMock,
                    DonationTable: {
                      donations: {
                        nodes: isEmpty
                          ? []
                          : [
                              {
                                id: 'donation-1',
                                amount: {
                                  amount: zeroAmount ? 0 : 10,
                                  convertedAmount: zeroAmount ? 0 : 10,
                                  convertedCurrency: 'CAD',
                                  currency: 'CAD',
                                },
                                appeal: {
                                  id: noDonationsMatchAppeal
                                    ? 'appeal-99'
                                    : appealId,
                                  name: 'Appeal 1',
                                },
                                designationAccount: {
                                  id: 'designation-account-1',
                                  name: 'Designation Account 1',
                                },
                                donationDate: '2023-03-01',
                                donorAccount: {
                                  contacts: {
                                    nodes: [
                                      {
                                        id: defaultContact.id,
                                      },
                                    ],
                                  },
                                  id: defaultContact.id,
                                  displayName: defaultContact.name,
                                },
                                paymentMethod: 'Check',
                              },
                              {
                                id: 'donation-2',
                                amount: {
                                  amount: hasForeignCurrency ? 200 : 100,
                                  convertedAmount: 100,
                                  convertedCurrency: 'CAD',
                                  currency: hasForeignCurrency ? 'USD' : 'CAD',
                                },
                                appeal: null,
                                donationDate: '2023-03-02',
                                donorAccount: {
                                  contacts: {
                                    nodes: [],
                                  },
                                  displayName: 'Donor 2',
                                },
                                paymentMethod: 'Credit Card',
                              },
                              {
                                id: 'donation-3',
                                amount: {
                                  amount: 0,
                                  convertedAmount: 0,
                                  convertedCurrency: 'CAD',
                                  currency: 'CAD',
                                },
                                appeal: null,
                                designationAccount: {
                                  id: 'designation-account-2',
                                  name: 'Designation Account 2',
                                },
                                donationDate: '2023-03-01',
                                donorAccount: {
                                  contacts: {
                                    nodes: [
                                      {
                                        id: defaultContact.id,
                                      },
                                    ],
                                  },
                                  id: defaultContact.id,
                                  displayName: defaultContact.name,
                                },
                                paymentMethod: 'Credit Card',
                              },
                            ],
                        pageInfo: {
                          endCursor: 'cursor',
                          hasNextPage: hasMultiplePages,
                        },
                      },
                    },
                  }}
                  onCall={mutationSpy}
                >
                  <AppealsWrapper>
                    <AppealsContext.Provider
                      value={
                        {
                          accountListId,
                          appealId: appealId,
                        } as unknown as AppealsType
                      }
                    >
                      <UpdateDonationsModal
                        handleClose={handleClose}
                        contact={defaultContact}
                        pledge={
                          pledge as AppealContactInfoFragment['pledges'][0]
                        }
                      />
                    </AppealsContext.Provider>
                  </AppealsWrapper>
                </GqlMockedProvider>
              </TestRouter>
            </ThemeProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </SnackbarProvider>
    </I18nextProvider>
  );
};

describe('UpdateDonationsModal', () => {
  it('default', () => {
    const { getByRole, getByTestId } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Update Donations' }),
    ).toBeInTheDocument();

    expect(getByTestId('LoadingBox')).toBeInTheDocument();

    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('should close modal', () => {
    const { getByRole } = render(<Components />);

    expect(handleClose).toHaveBeenCalledTimes(0);
    userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  describe('Introduction Text', () => {
    it('should show name and pledge amount', () => {
      const { getByText } = render(<Components />);
      expect(
        getByText(
          `Select donations that make up this commitment by ${defaultContact.name} of $110.`,
        ),
      ).toBeInTheDocument();
    });
    it('should show name with no pledge amount', () => {
      const { getByText } = render(<Components pledge={null} />);
      expect(
        getByText(
          `Select donations that make up this commitment by ${defaultContact.name}.`,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Donations', () => {
    it('should show no donations', async () => {
      const { findByText, getByRole, queryByTestId } = render(
        <Components isEmpty />,
      );
      expect(
        await findByText(`No donations received for ${defaultContact.name}`),
      ).toBeInTheDocument();

      expect(queryByTestId('LoadingBox')).not.toBeInTheDocument();

      expect(
        getByRole('button', {
          name: 'Add New Donation',
        }),
      ).toBeInTheDocument();
    });
    it('should open up Add New Donation Modal', async () => {
      const { findByRole } = render(<Components isEmpty />);

      const addDonation = await findByRole('button', {
        name: 'Add New Donation',
      });
      userEvent.click(addDonation);

      expect(
        await findByRole('heading', { name: 'Add Donation' }),
      ).toBeInTheDocument();
    });
  });

  describe('Donations - Empty', () => {
    it('should not show no donations', async () => {
      const { queryByText } = render(<Components isEmpty />);
      expect(
        queryByText(`No donations received for ${defaultContact.name}`),
      ).not.toBeInTheDocument();
    });

    it('should open up Add New Donation Modal', async () => {
      const { findByRole } = render(<Components isEmpty />);

      const addDonation = await findByRole('button', {
        name: 'Add New Donation',
      });
      userEvent.click(addDonation);

      expect(
        await findByRole('heading', { name: 'Add Donation' }),
      ).toBeInTheDocument();
    });
  });

  describe('Donations - Table functionality', () => {
    it('uses the default total and disabled save when no donations are selected', async () => {
      const { findByRole, getByRole } = render(
        <Components noDonationsMatchAppeal={true} />,
      );

      const totalRow = within(
        await findByRole('table', { name: 'Donation Totals' }),
      ).getByRole('row');
      expect(totalRow.children[0]).toHaveTextContent('Total Donations: CA$0');

      expect(getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('hides currency column when all currencies match the account currency', async () => {
      const { queryByRole, findByRole, queryByTestId } = render(<Components />);

      expect(
        await findByRole('gridcell', { name: 'Designation Account 1' }),
      ).toBeInTheDocument();
      expect(queryByTestId('LoadingBox')).not.toBeInTheDocument();
      expect(
        queryByRole('columnheader', { name: 'Foreign Amount' }),
      ).not.toBeInTheDocument();

      const totalRow = within(
        await findByRole('table', { name: 'Donation Totals' }),
      ).getByRole('row');
      await waitFor(() =>
        expect(totalRow.children[0]).toHaveTextContent(
          'Total Donations: CA$10',
        ),
      );
    });

    it('selects one donation onload as it was given to this appeal and then on selecting the other it should update the total amount', async () => {
      const { findAllByRole, findByRole } = render(<Components />);

      const checkboxes = await findAllByRole('checkbox');

      expect(checkboxes).toHaveLength(3);

      await waitFor(() => expect(checkboxes[0]).toBeChecked());
      expect(checkboxes[1]).not.toBeChecked();

      const totalRow = within(
        await findByRole('table', { name: 'Donation Totals' }),
      ).getByRole('row');
      expect(totalRow.children[0]).toHaveTextContent('Total Donations: CA$10');

      userEvent.click(checkboxes[1]);

      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();

      expect(totalRow.children[0]).toHaveTextContent('Total Donations: CA$110');
    });

    it('unselecting preselected donations crosses out the appeal name', async () => {
      const { getByText, findAllByRole } = render(<Components />);

      const checkboxes = await findAllByRole('checkbox');

      await waitFor(() => expect(checkboxes[0]).toBeChecked());
      userEvent.click(checkboxes[0]);

      expect(getByText('Appeal 1')).toHaveStyle(
        'text-decoration: line-through',
      );
    });

    it('shows currency column when a currency does not match the account currency', async () => {
      const { findByRole } = render(<Components hasForeignCurrency />);

      expect(
        await findByRole('columnheader', { name: 'Foreign Amount' }),
      ).toBeInTheDocument();

      const totalRow = within(
        await findByRole('table', { name: 'Donation Totals' }),
      ).getByRole('row');
      await waitFor(() =>
        expect(totalRow.children[0]).toHaveTextContent(
          'Total Donations: CA$10',
        ),
      );
    });

    it('updates the sort order', async () => {
      const { findByRole, getAllByRole } = render(<Components />);

      const dateHeader = await findByRole('columnheader', { name: 'Date' });
      expect(
        within(dateHeader).getByTestId('ArrowUpwardIcon'),
      ).toBeInTheDocument();

      userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
      const cellsAsc = getAllByRole('gridcell', { name: /CA/ });
      expect(cellsAsc[0]).toHaveTextContent('CA$0');
      expect(cellsAsc[1]).toHaveTextContent('CA$10');
      expect(cellsAsc[2]).toHaveTextContent('CA$100');

      userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
      const cellsDesc = getAllByRole('gridcell', { name: /CA/ });
      expect(cellsDesc[0]).toHaveTextContent('CA$100');
      expect(cellsDesc[1]).toHaveTextContent('CA$10');
      expect(cellsDesc[2]).toHaveTextContent('CA$0');
    });

    it('loads multiple pages and shows the progress bar', async () => {
      const { findByRole, queryByRole } = render(
        <Components hasMultiplePages />,
      );

      expect(await findByRole('progressbar')).toBeInTheDocument();
      expect(
        queryByRole('table', { name: 'Donation Totals' }),
      ).not.toBeInTheDocument();

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('DonationTable', {
          donorAccountIds: ['designation-1'],
          after: 'cursor',
        }),
      );
    });

    it('updates the page size without reloading the donations', async () => {
      const { findByRole, getByRole } = render(<Components />);

      userEvent.click(await findByRole('combobox', { name: 'Rows per page:' }));
      userEvent.click(getByRole('option', { name: '50' }));

      await waitFor(() =>
        expect(mutationSpy).not.toHaveGraphqlOperation('DonationTable', {
          pageSize: 50,
        }),
      );
    });
  });

  describe('Handle mutation errors', () => {
    it('Update pledge errors', async () => {
      const { getByRole, findAllByRole } = render(
        <Components mutationsThrowErrors={true} />,
      );

      const checkboxes = await findAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
      userEvent.click(checkboxes[1]);

      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Error while updating donations',
          {
            variant: 'error',
          },
        );
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Error while updating commitment',
          {
            variant: 'error',
          },
        );
      });
    });

    it('Create pledge errors', async () => {
      const { getByRole, findAllByRole } = render(
        <Components mutationsThrowErrors={true} pledge={null} />,
      );

      const checkboxes = await findAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);

      const saveButton = getByRole('button', { name: 'Save' });
      await waitFor(() => expect(saveButton).not.toBeDisabled());
      userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Error while trying to create a commitment',
          {
            variant: 'error',
          },
        );
      });
    });
  });

  describe('Update donations functionality', () => {
    const { appeal: _appeal, ...restOfPledge } = defaultPledge;
    describe('Zero amount', () => {
      it('should show error message if total is zero and no pledge', async () => {
        const { getByRole, findByRole, findAllByRole } = render(
          <Components pledge={null} />,
        );

        const checkboxes = await findAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3);
        userEvent.click(checkboxes[0]);
        expect(checkboxes[0]).not.toBeChecked();
        expect(checkboxes[1]).not.toBeChecked();
        expect(checkboxes[2]).not.toBeChecked();

        userEvent.click(checkboxes[2]);

        const totalRow = within(
          await findByRole('table', { name: 'Donation Totals' }),
        ).getByRole('row');
        expect(totalRow.children[0]).toHaveTextContent('Total Donations: CA$0');

        userEvent.click(getByRole('button', { name: 'Save' }));

        await waitFor(() =>
          expect(mockEnqueue).toHaveBeenCalledWith(
            'Unable to create a pledge with the amount of $0',
            {
              variant: 'error',
            },
          ),
        );
      });

      it('should show error message if total is zero and has a pledge', async () => {
        const { getByRole, findAllByRole } = render(<Components />);
        const checkboxes = await findAllByRole('checkbox');
        userEvent.click(checkboxes[0]);
        userEvent.click(checkboxes[2]);
        userEvent.click(getByRole('button', { name: 'Save' }));

        await waitFor(() =>
          expect(mockEnqueue).toHaveBeenCalledWith(
            'Unable to create a pledge with the amount of $0',
            {
              variant: 'error',
            },
          ),
        );
      });
    });

    describe('Less than pledge amount', () => {
      it('should show less than pledge confirmation', async () => {
        const { getByRole, getByTestId } = render(<Components />);

        await waitFor(
          () => {
            expect(getByRole('button', { name: 'Save' })).not.toBeDisabled();
          },
          { timeout: 3000 },
        );

        userEvent.click(getByRole('button', { name: 'Save' }));

        expect(getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();

        expect(getByTestId('confirmModalMessage')).toHaveTextContent(
          'The total amount is less than the commitment amount.',
        );
      });

      it('should move contact to Received', async () => {
        const { getByRole } = render(<Components />);

        await waitFor(
          () => {
            expect(getByRole('button', { name: 'Save' })).not.toBeDisabled();
          },
          { timeout: 3000 },
        );

        userEvent.click(getByRole('button', { name: 'Save' }));
        userEvent.click(getByRole('button', { name: 'No' }));

        await waitFor(() =>
          expect(mutationSpy).toHaveGraphqlOperation(
            'UpdateAccountListPledge',
            {
              input: {
                pledgeId: defaultPledge.id,
                attributes: {
                  ...restOfPledge,
                  appealId: appealId,
                  contactId: defaultContact.id,
                  status: PledgeStatusEnum.ReceivedNotProcessed,
                },
              },
            },
          ),
        );

        expect(handleClose).toHaveBeenCalled();
      });

      it('should move contact to Processed', async () => {
        const { getByRole } = render(<Components />);

        await waitFor(
          () => {
            expect(getByRole('button', { name: 'Save' })).not.toBeDisabled();
          },
          { timeout: 3000 },
        );

        userEvent.click(getByRole('button', { name: 'Save' }));
        userEvent.click(getByRole('button', { name: 'Yes' }));

        await waitFor(() =>
          expect(mutationSpy).toHaveGraphqlOperation(
            'UpdateAccountListPledge',
            {
              input: {
                pledgeId: defaultPledge.id,
                attributes: {
                  ...restOfPledge,
                  appealId: appealId,
                  contactId: defaultContact.id,
                  amount: 10,
                  status: PledgeStatusEnum.Processed,
                },
              },
            },
          ),
        );

        expect(handleClose).toHaveBeenCalled();
      });
    });

    describe('Correct or over the amount', () => {
      it('should move contact to Processed', async () => {
        const { getByRole, findByRole, findAllByRole } = render(<Components />);

        const checkboxes = await findAllByRole('checkbox');
        userEvent.click(checkboxes[1]);
        userEvent.click(checkboxes[2]);

        const totalRow = within(
          await findByRole('table', { name: 'Donation Totals' }),
        ).getByRole('row');
        expect(totalRow.children[0]).toHaveTextContent(
          'Total Donations: CA$110',
        );

        userEvent.click(getByRole('button', { name: 'Save' }));

        await waitFor(() =>
          expect(mutationSpy).toHaveGraphqlOperation(
            'UpdateAccountListPledge',
            {
              input: {
                pledgeId: defaultPledge.id,
                attributes: {
                  ...restOfPledge,
                  appealId: appealId,
                  contactId: defaultContact.id,
                  status: PledgeStatusEnum.Processed,
                },
              },
            },
          ),
        );
        expect(handleClose).toHaveBeenCalled();
      });

      it('should move contact to Processed and update pledge amount when given more than pledge', async () => {
        const { getByRole, findByRole, findAllByRole } = render(
          <Components
            pledge={{
              ...defaultPledge,
              amount: 50,
            }}
          />,
        );

        const checkboxes = await findAllByRole('checkbox');
        userEvent.click(checkboxes[1]);
        userEvent.click(checkboxes[2]);

        const totalRow = within(
          await findByRole('table', { name: 'Donation Totals' }),
        ).getByRole('row');
        expect(totalRow.children[0]).toHaveTextContent(
          'Total Donations: CA$110',
        );

        userEvent.click(getByRole('button', { name: 'Save' }));

        await waitFor(() =>
          expect(mutationSpy).toHaveGraphqlOperation(
            'UpdateAccountListPledge',
            {
              input: {
                pledgeId: defaultPledge.id,
                attributes: {
                  ...restOfPledge,
                  amount: 110,
                  appealId: appealId,
                  contactId: defaultContact.id,
                  status: PledgeStatusEnum.Processed,
                },
              },
            },
          ),
        );

        expect(mutationSpy).toHaveGraphqlOperation('UpdateDonations', {
          input: {
            accountListId,
            attributes: [
              {
                id: 'donation-2',
                appealId: 'appealId',
              },
              {
                id: 'donation-3',
                appealId: 'appealId',
              },
            ],
          },
        }),
          expect(handleClose).toHaveBeenCalled();
      });
    });
  });
  describe('Creating a new pledge', () => {
    it('should show create pledge with pre-selected donations', async () => {
      const { getByRole, findByRole, findAllByRole } = render(
        <Components pledge={null} />,
      );

      const checkboxes = await findAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);

      const totalRow = within(
        await findByRole('table', { name: 'Donation Totals' }),
      ).getByRole('row');
      await waitFor(() =>
        expect(totalRow.children[0]).toHaveTextContent(
          'Total Donations: CA$10',
        ),
      );

      const saveButton = getByRole('button', { name: 'Save' });
      await waitFor(() => expect(saveButton).not.toBeDisabled());
      userEvent.click(saveButton);

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('CreateAccountListPledge', {
          input: {
            accountListId,
            attributes: {
              appealId: appealId,
              contactId: defaultContact.id,
              expectedDate: '2020-01-01',
              amount: 10,
              amountCurrency: 'CAD',
            },
          },
        }),
      );

      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully created a new commitment',
        {
          variant: 'success',
        },
      );
    });

    it('should show create pledge via updating donations', async () => {
      const { getByRole, findByRole, findAllByRole } = render(
        <Components pledge={null} />,
      );

      const checkboxes = await findAllByRole('checkbox');
      userEvent.click(checkboxes[0]);
      userEvent.click(checkboxes[1]);

      const totalRow = within(
        await findByRole('table', { name: 'Donation Totals' }),
      ).getByRole('row');
      expect(totalRow.children[0]).toHaveTextContent('Total Donations: CA$10');

      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateDonations', {
          input: {
            accountListId,
            attributes: [
              {
                id: 'donation-1',
                appealId: 'none',
              },
              {
                id: 'donation-2',
                appealId: 'appealId',
              },
            ],
          },
        }),
      );

      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully updated donations',
        {
          variant: 'success',
        },
      );

      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully created a new commitment',
        {
          variant: 'success',
        },
      );
    });
  });
});
