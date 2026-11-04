import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { setupMocks } from '__tests__/util/googlePlacesMock';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/ContactDetailsTab.generated';
import { createCache } from 'src/lib/apollo/cache';
import theme from '../../../../../../theme';
import { AddAddressModal } from './AddAddressModal';

const handleClose = jest.fn();
const accountListId = 'abc';
const contactId = '123';

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

jest.mock('@react-google-maps/api');

describe('AddAddressModal', () => {
  beforeEach(() => {
    setupMocks();
  });

  it("adds the new address to the contact's cached details with every field they need", async () => {
    const cache = createCache();
    const variables = { accountListId, contactId };
    cache.writeQuery({
      query: ContactDetailsTabDocument,
      variables,
      data: gqlMock<ContactDetailsTabQuery, typeof variables>(
        ContactDetailsTabDocument,
        { variables, mocks: { contact: { id: contactId } } },
      ),
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider cache={cache}>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.type(getByRole('combobox', { name: 'Street' }), '1 New St');
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Address added successfully', {
        variant: 'success',
      }),
    );

    // A missing field leaves the cache incomplete, so Apollo refetches the contact's queries
    const missingFields = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.includes('Missing field'));
    expect(missingFields).toEqual([]);
    consoleError.mockRestore();
  });

  it("refreshes the contact's address change chip and the change history", async () => {
    const cache = createCache();
    const evict = jest.spyOn(cache, 'evict');
    const mutationSpy = jest.fn();
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider cache={cache} onCall={mutationSpy}>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.type(getByRole('combobox', { name: 'Street' }), '1 New St');
    userEvent.click(getByText('Save'));

    // Refetch just this contact's primary address: evicting it would reload the whole contacts list
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'ContactPrimaryAddressChange',
        {
          accountListId,
          contactId,
        },
      ),
    );
    expect(evict).toHaveBeenCalledWith({ fieldName: 'addressChangeHistory' });
    expect(evict).not.toHaveBeenCalledWith(
      expect.objectContaining({ fieldName: 'primaryAddress' }),
    );
  });

  it('refreshes the chip even when making the new address primary fails', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider
            onCall={mutationSpy}
            mocks={{
              SetContactPrimaryAddress: () => {
                throw new Error('Server Error');
              },
            }}
          >
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.type(getByRole('combobox', { name: 'Street' }), '1 New St');
    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'ContactPrimaryAddressChange',
        {
          accountListId,
          contactId,
        },
      ),
    );

    expect(mockEnqueue).not.toHaveBeenCalledWith(
      'Address added successfully',
      expect.anything(),
    );
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("doesn't refresh the chip when saving the address fails", async () => {
    const mutationSpy = jest.fn();
    const failingSave = jest.fn(() => {
      throw new Error('Server Error');
    });
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider
            onCall={mutationSpy}
            mocks={{ CreateContactAddress: failingSave }}
          >
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.type(getByRole('combobox', { name: 'Street' }), '1 New St');
    userEvent.click(getByText('Save'));

    await waitFor(() => expect(failingSave).toHaveBeenCalled());
    // Its error is already shown; a refetch would fail the same way and show it twice
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mutationSpy).not.toHaveGraphqlOperation(
      'ContactPrimaryAddressChange',
    );
  });
});
