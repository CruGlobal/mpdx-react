import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../../../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../../../../../../__tests__/util/TestRouter';
import { CreateContactMutation } from './CreateContact.generated';
import CreateContact from './CreateContact';

const accountListId = '111';
const handleClose = jest.fn();

const router = {
  push: jest.fn(),
};

describe('CreateContact', () => {
  it('default', () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<CreateContactMutation>>
            <CreateContact
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    expect(queryByText('New Contact')).toBeInTheDocument();
  });

  it('closes menu', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<CreateContactMutation>>
            <CreateContact
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Contact Creation', () => {
    const mutationSpy = jest.fn();
    const name = 'Huffman, Christian';
    it('creates contact', async () => {
      const { getByText, findByText, getByRole } = render(
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<CreateContactMutation> onCall={mutationSpy}>
              <CreateContact
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>,
      );

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();
      userEvent.type(getByRole('textbox', { name: 'Name' }), name);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      const { operation, response } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.name).toEqual(name);
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/contacts/[contactId]',
        query: {
          accountListId,
          contactId: response.data.createContact.contact.id,
        },
      });
    });
  });
});
