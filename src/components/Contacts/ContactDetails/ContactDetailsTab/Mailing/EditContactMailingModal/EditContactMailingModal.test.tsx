import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { SendNewsletterEnum } from '../../../../../../../graphql/types.generated';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import {
  ContactMailingFragment,
  ContactMailingFragmentDoc,
} from '../ContactMailing.generated';
import { EditContactMailingModal } from './EditContactMailingModal';
import { UpdateContactMailingMutation } from './EditContactMailingModal.generated';

const handleClose = jest.fn();
const mock = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc);
const contactId = '123';
const accountListId = 'abc';

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

const mockContact: ContactMailingFragment = {
  name: 'test person',
  id: contactId,
  greeting: 'Hello test',
  envelopeGreeting: 'Dear Test',
  sendNewsletter: SendNewsletterEnum.Email,
  addresses: {
    nodes: [
      {
        ...mock.addresses.nodes[0],
        location: 'Home',
        historic: true,
        street: '123 Cool Street',
      },
    ],
  },
};

describe('EditContactMailingModal', () => {
  it('should render edit contact mailing modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactMailingMutation>>
            <EditContactMailingModal
              accountListId={accountListId}
              isOpen={true}
              handleClose={handleClose}
              contact={mockContact}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Mailing Details')).toBeInTheDocument();
  });

  it('should close edit contact mailing modal', () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactMailingMutation>>
            <EditContactMailingModal
              accountListId={accountListId}
              isOpen={true}
              handleClose={handleClose}
              contact={mockContact}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Mailing Details')).toBeInTheDocument();
    userEvent.click(getByRole('button', { hidden: true, name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactMailingMutation>>
            <EditContactMailingModal
              accountListId={accountListId}
              isOpen={true}
              handleClose={handleClose}
              contact={mockContact}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Mailing Details')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should edit contact mailing details', async () => {
    const mutationSpy = jest.fn();
    const newGreeting = 'New greeting';
    const newEnvelopeGreeting = 'New Envelope Greeting';

    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactMailingMutation> onCall={mutationSpy}>
            <EditContactMailingModal
              accountListId={accountListId}
              isOpen={true}
              handleClose={handleClose}
              contact={mockContact}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );
    userEvent.clear(getByRole('textbox', { hidden: true, name: 'Greeting' }));
    userEvent.clear(
      getByRole('textbox', { hidden: true, name: 'Envelope Name Line' }),
    );
    userEvent.click(getByRole('button', { hidden: true, name: 'Newsletter' }));
    userEvent.click(
      getByRole('option', { hidden: true, name: SendNewsletterEnum.Both }),
    );
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Greeting' }),
      newGreeting,
    );
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Envelope Name Line' }),
      newEnvelopeGreeting,
    );
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];

    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.sendNewsletter).toEqual(
      SendNewsletterEnum.Both,
    );
    expect(operation.variables.attributes.greeting).toEqual(newGreeting);
    expect(operation.variables.attributes.envelopeGreeting).toEqual(
      newEnvelopeGreeting,
    );
  });
});
