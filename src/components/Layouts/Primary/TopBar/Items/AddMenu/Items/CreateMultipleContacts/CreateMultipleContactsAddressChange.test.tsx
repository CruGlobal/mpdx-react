import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { setupMocks } from '__tests__/util/googlePlacesMock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { CreateContactAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/CreateContactAddress.generated';
import { createCache } from 'src/lib/apollo/cache';
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

  describe('Contact Creation', () => {
    const first = 'Christian';
    const last = 'Huffman';
    const address = '123 Main Street';

    it('drops the change history when another contact fails', async () => {
      const cache = createCache();
      const evict = jest.spyOn(cache, 'evict');
      let primaryCalls = 0;
      const { getByText, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateContactMocks>
                cache={cache}
                mocks={{
                  CreateContact: {
                    createContact: { contact: { id: 'contact-1' } },
                  },
                  CreateContactAddress: {
                    createAddress: { address: { id: 'address-1' } },
                  },
                  SetContactPrimaryAddress: () => {
                    primaryCalls += 1;
                    if (primaryCalls > 1) {
                      throw new Error('Server Error');
                    }
                    return { setContactPrimaryAddress: { addresses: [] } };
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

      // Each row has an address combobox and a status combobox
      [0, 1].forEach((row) => {
        userEvent.type(getAllByRole('textbox', { name: 'First' })[row], first);
        userEvent.type(getAllByRole('textbox', { name: 'Last' })[row], last);
        userEvent.type(getAllByRole('combobox')[row * 2], address);
      });
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));

      await waitFor(() => expect(primaryCalls).toBe(2));
      expect(evict).toHaveBeenCalledWith({
        fieldName: 'addressChangeHistory',
      });
    }, 20000);
  });
});
