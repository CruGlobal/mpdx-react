import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { setupMocks } from '__tests__/util/googlePlacesMock';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { createCache } from 'src/lib/apollo/cache';
import theme from '../../../../../../theme';
import {
  ContactMailingFragment,
  ContactMailingFragmentDoc,
} from '../ContactMailing.generated';
import { EditContactAddressModal } from './EditContactAddressModal';

const handleClose = jest.fn();
const mock = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc);
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

const mockContact: ContactMailingFragment = {
  id: '123',
  name: mock.name,
  addresses: {
    nodes: [
      {
        ...mock.addresses.nodes[0],
        location: 'Home',
        historic: true,
        street: '123 Cool Street',
        primaryMailingAddress: false,
        source: 'MPDX',
      },
    ],
  },
};

describe('EditContactAddressModal', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('refreshes the chip even when changing the primary address fails', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByLabelText } = render(
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
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.click(getByLabelText('Primary'));
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
      'Address updated successfully',
      expect.anything(),
    );
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("doesn't refresh the chip when saving the address fails", async () => {
    const mutationSpy = jest.fn();
    const failingSave = jest.fn(() => {
      throw new Error('Server Error');
    });
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider
            onCall={mutationSpy}
            mocks={{ UpdateContactAddress: failingSave }}
          >
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.click(getByText('Save'));

    await waitFor(() => expect(failingSave).toHaveBeenCalled());
    // Its error is already shown; a refetch would fail the same way and show it twice
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mutationSpy).not.toHaveGraphqlOperation(
      'ContactPrimaryAddressChange',
    );
  });

  describe("refreshes the contact's address change chip and the change history", () => {
    const renderWithCache = () => {
      const cache = createCache();
      const evict = jest.spyOn(cache, 'evict');
      const mutationSpy = jest.fn();
      const utils = render(
        <SnackbarProvider>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider cache={cache} onCall={mutationSpy}>
              <EditContactAddressModal
                contactId={contactId}
                accountListId={accountListId}
                handleClose={handleClose}
                address={mockContact.addresses.nodes[0]}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </SnackbarProvider>,
      );
      return { ...utils, evict, mutationSpy };
    };
    it('after an edit', async () => {
      const { getByRole, getByText, evict, mutationSpy } = renderWithCache();

      const street = getByRole('combobox', { name: 'Street' });
      userEvent.clear(street);
      userEvent.type(street, '1 Changed St');
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
    }, 30000);

    it('after a delete', async () => {
      const { getByTestId, evict, mutationSpy } = renderWithCache();

      userEvent.click(getByTestId('modal-delete-button'));

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
  });
});
