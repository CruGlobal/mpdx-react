import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { placePromise, setupMocks } from '__tests__/util/googlePlacesMock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { CreateContactAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/CreateContactAddress.generated';
import { StatusEnum } from 'src/graphql/types.generated';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
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
                        status: status,
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
        contactPartnershipStatus[status].translated,
      );
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      const { operation } = mutationSpy.mock.calls[1][0];
      expect(operation.variables).toMatchObject({
        accountListId,
        attributes: {
          name: `${last}, ${first} and ${spouse}`,
          contactReferralsToMe: undefined,
          status: StatusEnum.NeverContacted,
        },
      });

      const { operation: personOperation } = mutationSpy.mock.calls[3][0];
      expect(personOperation.variables.accountListId).toEqual(accountListId);
      expect(personOperation.variables.attributes.firstName).toEqual(first);
      expect(personOperation.variables.attributes.lastName).toEqual(last);
      expect(personOperation.variables.attributes.phoneNumbers).toEqual([
        {
          number: phone,
          primary: true,
        },
      ]);
      expect(personOperation.variables.attributes.emailAddresses).toEqual([
        {
          email: email,
          primary: true,
        },
      ]);

      expect(mutationSpy.mock.calls[5][0].operation).toMatchObject({
        operationName: 'CreateContactAddress',
        variables: {
          accountListId,
          attributes: {
            contactId: 'contact-1',
            street: address,
          },
        },
      });
      expect(mutationSpy.mock.calls[6][0].operation).toMatchObject({
        operationName: 'SetContactPrimaryAddress',
        variables: {
          contactId: 'contact-1',
          primaryAddressId: 'address-1',
        },
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

      const { operation } = mutationSpy.mock.calls[1][0];
      expect(operation).toMatchObject({
        operationName: 'CreateContact',
        variables: {
          accountListId,
          attributes: {
            contactReferralsToMe: [{ referredById: 'referrer-1' }],
          },
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
      const { operation } = mutationSpy.mock.calls[1][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.name).toEqual(
        `${last}, ${first} and ${spouse}`,
      );
      // Contact 2
      const { operation: operation1 } = mutationSpy.mock.calls[2][0];
      expect(operation1.variables.accountListId).toEqual(accountListId);
      expect(operation1.variables.attributes.name).toEqual(
        `${last2}, ${first2}`,
      );

      // Contact 1 Person 1
      const { operation: operation2 } = mutationSpy.mock.calls[4][0];
      expect(operation2.variables.accountListId).toEqual(accountListId);
      expect(operation2.variables.attributes.firstName).toEqual(first);
      expect(operation2.variables.attributes.lastName).toEqual(last);
      expect(operation2.variables.attributes.phoneNumbers).toEqual([
        {
          number: phone,
          primary: true,
        },
      ]);
      expect(operation2.variables.attributes.emailAddresses).toEqual([
        {
          email: email,
          primary: true,
        },
      ]);
      // Contact 2  Person 1
      const { operation: operation4 } = mutationSpy.mock.calls[5][0];
      expect(operation4.variables.accountListId).toEqual(accountListId);
      expect(operation4.variables.attributes.firstName).toEqual(first2);
      expect(operation4.variables.attributes.lastName).toEqual(last2);

      // Contact 1 Person 2 - Awaiting on Contact 1 Person 1 to resolve.
      const { operation: operation3 } = mutationSpy.mock.calls[6][0];
      expect(operation3.variables.accountListId).toEqual(accountListId);
      expect(operation3.variables.attributes.firstName).toEqual(spouse);
      expect(operation3.variables.attributes.lastName).toEqual(last);
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
      const { operation } = mutationSpy.mock.calls[1][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.name).toEqual(
        `${first2} and ${spouse2}`,
      );
      // Contact 2
      const { operation: operation1 } = mutationSpy.mock.calls[2][0];
      expect(operation1.variables.accountListId).toEqual(accountListId);
      expect(operation1.variables.attributes.name).toEqual(first3);

      // Contact 2  Person 1
      const { operation: operation2 } = mutationSpy.mock.calls[4][0];
      expect(operation2.variables.accountListId).toEqual(accountListId);
      expect(operation2.variables.attributes.firstName).toEqual(first2);
      expect(operation2.variables.attributes.lastName).toEqual('');

      // Contact 3  Person 1
      const { operation: operation4 } = mutationSpy.mock.calls[5][0];
      expect(operation4.variables.accountListId).toEqual(accountListId);
      expect(operation4.variables.attributes.firstName).toEqual(first3);
      expect(operation4.variables.attributes.lastName).toEqual('');

      // Contact 2  Person 2 - Awaiting on Contact 2 Person 1 to resolve
      const { operation: operation3 } = mutationSpy.mock.calls[6][0];
      expect(operation3.variables.accountListId).toEqual(accountListId);
      expect(operation3.variables.attributes.firstName).toEqual(spouse2);
      expect(operation3.variables.attributes.lastName).toEqual('');
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

      const { operation } = mutationSpy.mock.calls[3][0];
      expect(operation).toMatchObject({
        operationName: 'CreateContactAddress',
        variables: {
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
        },
      });
    }, 20000);
  });
});
