import { SendNewsletterEnum } from '../../../../../../../graphql/types.generated';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import { EditMailingInfoModal } from './EditMailingInfoModal';
import { EditMailingInfoMutation } from './EditMailingInfoModal.generated';

const handleClose = jest.fn();
const accountListId = 'abc';
const contact = {
  id: '123',
  greeting: 'Name',
  envelopeGreeting: 'Full Name',
  sendNewsletter: SendNewsletterEnum.Both,
};

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

describe('EditMailingInfoModal', () => {
  it('should render edit mailing info modal', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<EditMailingInfoMutation>>
            <EditMailingInfoModal
              accountListId={accountListId}
              contact={contact}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Mailing Information')).toBeInTheDocument();
  });

  it('should close render edit mailing info modal', async () => {
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<EditMailingInfoMutation>>
            <EditMailingInfoModal
              accountListId={accountListId}
              contact={contact}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Mailing Information')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<EditMailingInfoMutation>>
            <EditMailingInfoModal
              accountListId={accountListId}
              contact={contact}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Mailing Information')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should edit mailing info', async () => {
    const mutationSpy = jest.fn();
    const newGreeting = 'New Name';
    const newEnvelopeGreeting = 'New Full Name';
    const newSendNewsletter = SendNewsletterEnum.None;
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<EditMailingInfoMutation> onCall={mutationSpy}>
            <EditMailingInfoModal
              accountListId={accountListId}
              contact={contact}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    const greetingInput = getByLabelText('Greeting');
    expect(greetingInput).toHaveValue(contact.greeting);
    userEvent.clear(greetingInput);
    userEvent.type(greetingInput, newGreeting);

    const envelopeGreetingInput = getByLabelText('Envelope Name Line');
    expect(envelopeGreetingInput).toHaveValue(contact.envelopeGreeting);
    userEvent.clear(envelopeGreetingInput);
    userEvent.type(envelopeGreetingInput, newEnvelopeGreeting);

    const sendNewsletterInput = getByLabelText('Newsletter');
    expect(sendNewsletterInput.textContent).toEqual('Both');
    userEvent.click(sendNewsletterInput);
    userEvent.click(getByText('None'));

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Mailing information edited successfully',
        {
          variant: 'success',
        },
      ),
    );

    const { operation } = mutationSpy.mock.calls[0][0];

    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.greeting).toEqual(newGreeting);
    expect(operation.variables.attributes.envelopeGreeting).toEqual(
      newEnvelopeGreeting,
    );
    expect(operation.variables.attributes.sendNewsletter).toEqual(
      newSendNewsletter,
    );
  });
});
