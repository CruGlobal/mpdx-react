import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { placePromise, setupMocks } from '__tests__/util/googlePlacesMock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { CreateContactAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/CreateContactAddress.generated';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../../../../../theme';
import { CreateContactMutation } from '../CreateContact/CreateContact.generated';
import { CreateMultipleContacts } from './CreateMultipleContacts';

jest.mock('@react-google-maps/api');

interface CreateContactMocks {
  CreateContact: CreateContactMutation;
  CreateContactAddress: CreateContactAddressMutation;
}

const accountListId = '111';
const handleClose = jest.fn();

const router = {
  push: jest.fn(),
};

describe('CreateMultipleContacts', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('default', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <CreateMultipleContacts
                accountListId={accountListId}
                handleClose={handleClose}
                rows={3}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('Spouse')).toBeInTheDocument();
    expect(queryByText('Last')).toBeInTheDocument();
    expect(queryByText('Street Address')).toBeInTheDocument();
    expect(queryByText('Phone')).toBeInTheDocument();
    expect(queryByText('Email')).toBeInTheDocument();
  });

  it('closes menu', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <CreateMultipleContacts
                accountListId={accountListId}
                handleClose={handleClose}
                rows={3}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Contact Creation', () => {
    const mutationSpy = jest.fn();
    const first = 'Christian';
    const last = 'Huffman';
    const spouse = 'Kaylee';
    const address = '123 Main Street';
    const phone = '+1 (111) 222-3344';
    const email = 'christian.huffman@cru.org';
    const status = StatusEnum.PartnerFinancial;
    const statusTextName =
      loadConstantsMockData.constant.status?.find((s) => s.id === status)
        ?.value || '';

    const first2 = 'Robert';
    const last2 = 'Eldredge';
    const spouse2 = 'Sarah';

    const first3 = 'Cool';

    it('creates one contact', async () => {
      const { getByText, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateContactMocks>
                onCall={mutationSpy}
                mocks={{
                  CreateContact: {
                    createContact: {
                      contact: {
                        id: 'contact-1',
                      },
                    },
                  },
                  CreateContactAddress: {
                    createAddress: {
                      address: {
                        id: 'address-1',
                      },
                    },
                  },
                }}
              >
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.type(getAllByRole('textbox', { name: 'Last' })[0], last);
      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse);
      userEvent.type(getAllByRole('combobox')[0], address);
      userEvent.type(getAllByRole('textbox', { name: 'Phone' })[0], phone);
      userEvent.type(getAllByRole('textbox', { name: 'Email' })[0], email);
      userEvent.type(
        getAllByRole('listbox', { name: 'Status' })[0],
        statusTextName,
      );
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last}, ${first} and ${spouse}`,
          contactReferralsToMe: undefined,
          status: StatusEnum.NeverContacted,
        },
      });

      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          contactId: 'contact-1',
          emailAddresses: [{ email: email, primary: true }],
          firstName: first,
          lastName: last,
          phoneNumbers: [{ number: phone, primary: true }],
        },
      });

      expect(mutationSpy).toHaveGraphqlOperation('CreateContactAddress', {
        accountListId,
        attributes: {
          contactId: 'contact-1',
          street: address,
        },
      });
      expect(mutationSpy).toHaveGraphqlOperation('SetContactPrimaryAddress', {
        contactId: 'contact-1',
        primaryAddressId: 'address-1',
      });
    }, 20000);

    it('creates one referral', async () => {
      const { getByRole, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<{ CreateContact: CreateContactMutation }>
                onCall={mutationSpy}
                mocks={{
                  CreateContact: {
                    createContact: {
                      contact: {
                        id: 'contact-1',
                      },
                    },
                  },
                }}
              >
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                  referredById={'referrer-1'}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          contactReferralsToMe: [{ referredById: 'referrer-1' }],
        },
      });
    });

    it('creates multiple contacts - part 1', async () => {
      const { getByText, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.type(getAllByRole('textbox', { name: 'First' })[1], first2);

      userEvent.type(getAllByRole('textbox', { name: 'Last' })[0], last);
      userEvent.type(getAllByRole('textbox', { name: 'Last' })[1], last2);

      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse);

      userEvent.type(getAllByRole('textbox', { name: 'Phone' })[0], phone);

      userEvent.type(getAllByRole('textbox', { name: 'Email' })[0], email);

      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      // Contact 1
      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last}, ${first} and ${spouse}`,
        },
      });
      // Contact 2
      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last2}, ${first2}`,
        },
      });

      // Contact 1 Person 1
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          emailAddresses: [{ email: email, primary: true }],
          firstName: first,
          lastName: last,
          phoneNumbers: [{ number: phone, primary: true }],
        },
      });
      // Contact 2  Person 1
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: first2,
          lastName: last2,
        },
      });

      // Contact 1 Person 2 - Awaiting on Contact 1 Person 1 to resolve.
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: spouse,
          lastName: last,
        },
      });
    });

    it('creates multiple contacts - part 2', async () => {
      const { getByText, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first2);
      userEvent.type(getAllByRole('textbox', { name: 'First' })[1], first3);

      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse2);

      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      // Contact 1
      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${first2} and ${spouse2}`,
        },
      });

      // Contact 2
      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: first3,
        },
      });

      // Contact 2  Person 1
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: first2,
          lastName: '',
        },
      });

      // Contact 3  Person 1
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: first3,
          lastName: '',
        },
      });

      // Contact 2  Person 2 - Awaiting on Contact 2 Person 1 to resolve
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: spouse2,
          lastName: '',
        },
      });
    });

    it('handles chosen address predictions', async () => {
      jest.useFakeTimers();

      const { getAllByRole, getByRole } = render(
        <SnackbarProvider>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider onCall={mutationSpy}>
              <CreateMultipleContacts
                accountListId={accountListId}
                handleClose={handleClose}
                rows={3}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </SnackbarProvider>,
      );

      // Let Google Maps initialize
      jest.runOnlyPendingTimers();

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      const addressAutocomplete = getAllByRole('combobox')[0];
      userEvent.type(addressAutocomplete, '100 Lake Hart');

      jest.advanceTimersByTime(2000);
      await act(async () => {
        await placePromise;
      });

      userEvent.click(
        getByRole('option', {
          name: '100 Lake Hart Dr, Orlando, FL 32832, USA',
        }),
      );
      expect(addressAutocomplete).toHaveValue('A/100 Lake Hart Drive');
      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('CreateContactAddress', {
          accountListId,
          attributes: {
            street: 'A/100 Lake Hart Drive',
            city: 'Orlando',
            region: 'Orange County',
            metroArea: 'Orlando',
            state: 'FL',
            country: 'United States',
            postalCode: '32832',
          },
        }),
      );
    }, 20000);

    it('creates one contact with default status', async () => {
      const { getByText, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateContactMocks>
                onCall={mutationSpy}
                mocks={{
                  CreateContact: {
                    createContact: {
                      contact: {
                        id: 'contact-1',
                      },
                    },
                  },
                  CreateContactAddress: {
                    createAddress: {
                      address: {
                        id: 'address-1',
                      },
                    },
                  },
                }}
              >
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.type(getAllByRole('textbox', { name: 'Last' })[0], last);
      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse);
      userEvent.type(getAllByRole('combobox')[0], address);
      userEvent.type(getAllByRole('textbox', { name: 'Phone' })[0], phone);
      userEvent.type(getAllByRole('textbox', { name: 'Email' })[0], email);

      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last}, ${first} and ${spouse}`,
          contactReferralsToMe: undefined,
          status: 'NEVER_CONTACTED',
        },
      });

      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          contactId: 'contact-1',
          emailAddresses: [{ email: email, primary: true }],
          firstName: first,
          lastName: last,
          phoneNumbers: [{ number: phone, primary: true }],
        },
      });

      expect(mutationSpy).toHaveGraphqlOperation('CreateContactAddress', {
        accountListId,
        attributes: {
          contactId: 'contact-1',
          street: address,
        },
      });
      expect(mutationSpy).toHaveGraphqlOperation('SetContactPrimaryAddress', {
        contactId: 'contact-1',
        primaryAddressId: 'address-1',
      });
    }, 20000);

    it('sets the contact status when creating new contacts', async () => {
      const { getByText, getAllByRole, findByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateContactMocks>
                onCall={mutationSpy}
                mocks={{
                  CreateContact: {
                    createContact: {
                      contact: {
                        id: 'contact-1',
                      },
                    },
                  },
                  CreateContactAddress: {
                    createAddress: {
                      address: {
                        id: 'address-1',
                      },
                    },
                  },
                }}
              >
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.type(getAllByRole('textbox', { name: 'Last' })[0], last);
      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse);
      userEvent.type(getAllByRole('combobox')[0], address);
      userEvent.type(getAllByRole('textbox', { name: 'Phone' })[0], phone);
      userEvent.type(getAllByRole('textbox', { name: 'Email' })[0], email);

      userEvent.tab();
      userEvent.keyboard('{arrowdown}');
      userEvent.keyboard('{arrowdown}');

      userEvent.click(
        await findByRole('option', { name: 'Partner - Financial' }),
      );
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last}, ${first} and ${spouse}`,
          contactReferralsToMe: undefined,
          status: 'PARTNER_FINANCIAL',
        },
      });
    }, 20000);
  });
});
