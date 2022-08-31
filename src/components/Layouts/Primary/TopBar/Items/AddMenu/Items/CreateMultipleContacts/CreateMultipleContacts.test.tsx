import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { MuiThemeProvider } from '@mui/material';
import { GqlMockedProvider } from '../../../../../../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../../../../../../__tests__/util/TestRouter';
import theme from '../../../../../../../../theme';
import { CreateContactMutation } from '../CreateContact/CreateContact.generated';
import { CreateMultipleContacts } from './CreateMultipleContacts';

const accountListId = '111';
const handleClose = jest.fn();

const router = {
  push: jest.fn(),
};

describe('CreateMultipleContacts', () => {
  it('default', () => {
    const { queryByText } = render(
      <MuiThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<CreateContactMutation>>
              <CreateMultipleContacts
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </MuiThemeProvider>,
    );
    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('Spouse')).toBeInTheDocument();
    expect(queryByText('Last')).toBeInTheDocument();
    expect(queryByText('Address')).toBeInTheDocument();
    expect(queryByText('Phone')).toBeInTheDocument();
    expect(queryByText('Email')).toBeInTheDocument();
  });

  it('closes menu', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<CreateContactMutation>>
              <CreateMultipleContacts
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </MuiThemeProvider>,
    );

    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Contact Creation', () => {
    const mutationSpy = jest.fn();
    const first = 'Christian';
    const last = 'Huffman';
    const spouse = 'Kaylee';

    const first2 = 'Robert';
    const last2 = 'Eldredge';
    const spouse2 = 'Sarah';

    const first3 = 'Cool';
    const last3 = 'Guy';

    it('creates one contact', async () => {
      const { getByText, getAllByRole } = render(
        <MuiThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateContactMutation> onCall={mutationSpy}>
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </MuiThemeProvider>,
      );

      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'First' })[0],
        first,
      );
      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'Last' })[0],
        last,
      );
      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'Spouse' })[0],
        spouse,
      );
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.name).toEqual(
        `${last}, ${first} and ${spouse}`,
      );
    });

    it('creates multiple contacts', async () => {
      const { getByText, getAllByRole } = render(
        <MuiThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateContactMutation> onCall={mutationSpy}>
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </MuiThemeProvider>,
      );

      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'First' })[0],
        first,
      );
      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'First' })[1],
        first2,
      );
      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'First' })[2],
        first3,
      );

      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'Last' })[0],
        last,
      );
      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'Last' })[1],
        last2,
      );
      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'Last' })[2],
        last3,
      );

      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'Spouse' })[0],
        spouse,
      );
      userEvent.type(
        getAllByRole('textbox', { hidden: true, name: 'Spouse' })[1],
        spouse2,
      );
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      // Contact 1
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.name).toEqual(
        `${last}, ${first} and ${spouse}`,
      );
      // Contact 2
      const { operation: operation2 } = mutationSpy.mock.calls[1][0];
      expect(operation2.variables.accountListId).toEqual(accountListId);
      expect(operation2.variables.attributes.name).toEqual(
        `${last2}, ${first2} and ${spouse2}`,
      );
      // Contact 3
      const { operation: operation3 } = mutationSpy.mock.calls[2][0];
      expect(operation3.variables.accountListId).toEqual(accountListId);
      expect(operation3.variables.attributes.name).toEqual(
        `${last3}, ${first3}`,
      );
    });
  });
});
