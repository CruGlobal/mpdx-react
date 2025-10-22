import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../../../../../../theme';
import CreateContact from './CreateContact';

const accountListId = '111';
const handleClose = jest.fn();

const router = {
  push: jest.fn(),
};

describe('CreateContact', () => {
  it('default', async () => {
    const { queryByLabelText } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <CreateContact
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(queryByLabelText('Name')).toBeInTheDocument());
  });

  it('closes menu', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <CreateContact
                accountListId={accountListId}
                handleClose={handleClose}
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
    const name = 'Skywalker, Anakin';
    it('creates contact', async () => {
      const { getByText, findByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <CreateContact
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.click(getByText('Save'));
      expect(await findByText('Name is required')).toBeInTheDocument();
      userEvent.type(
        getByRole('textbox', { hidden: true, name: 'Name' }),
        name,
      );
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      const { operation, response } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.name).toEqual(name);

      const { operation: operation1 } = mutationSpy.mock.calls[1][0];
      expect(operation1.variables.accountListId).toEqual(accountListId);
      expect(operation1.variables.attributes.firstName).toEqual('Anakin');
      expect(operation1.variables.attributes.lastName).toEqual('Skywalker');

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/contacts/[contactId]',
        query: {
          accountListId,
          contactId: response.data.createContact.contact.id,
        },
      });
    });
  });
  describe('Contact Creation with spouse', () => {
    const mutationSpy = jest.fn();
    const name = 'Skywalker, Anakin and Padme';
    it('creates contact', async () => {
      const { getByText, findByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <CreateContact
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.click(getByText('Save'));
      expect(await findByText('Name is required')).toBeInTheDocument();
      userEvent.type(
        getByRole('textbox', { hidden: true, name: 'Name' }),
        name,
      );
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      const { operation, response } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.name).toEqual(name);

      const { operation: operation1 } = mutationSpy.mock.calls[1][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation1.variables.attributes.firstName).toEqual('Anakin');
      expect(operation1.variables.attributes.lastName).toEqual('Skywalker');

      const { operation: operation2 } = mutationSpy.mock.calls[2][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation2.variables.attributes.firstName).toEqual('Padme');
      expect(operation2.variables.attributes.lastName).toEqual('Skywalker');

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
