import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import theme from '../../../../../../../theme';
import {
  ContactDetailsFragment,
  ContactDetailsFragmentDoc,
} from './EditContactDetails.generated';
import { EditContactDetailsModal } from './EditContactDetailsModal';

const handleClose = jest.fn();
const mock = gqlMock<ContactDetailsFragment>(ContactDetailsFragmentDoc);
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

const mockContact: ContactDetailsFragment = {
  name: 'test person',
  id: contactId,
  people: {
    nodes: [
      {
        ...mock.people.nodes[0],
        firstName: 'test',
        lastName: 'guy',
        id: mock.primaryPerson?.id ?? '',
      },
      ...mock.people.nodes,
    ],
  },
  primaryPerson: mock.primaryPerson,
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

describe('EditContactDetailsModal', () => {
  it('should render edit contact details modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <EditContactDetailsModal
                accountListId={accountListId}
                isOpen={true}
                handleClose={handleClose}
                contact={mockContact}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Details')).toBeInTheDocument();
  });

  it('should close edit contact details modal', () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <EditContactDetailsModal
                accountListId={accountListId}
                isOpen={true}
                handleClose={handleClose}
                contact={mockContact}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.click(getByRole('button', { hidden: true, name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <EditContactDetailsModal
                accountListId={accountListId}
                isOpen={true}
                handleClose={handleClose}
                contact={mockContact}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should edit contact details', async () => {
    const mutationSpy = jest.fn();
    const newContactName = 'Guy, Cool and Neat';
    const newPrimaryContactName = `${mockContact.people.nodes[1].firstName} ${mockContact.people.nodes[1].lastName}`;
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider onCall={mutationSpy}>
              <EditContactDetailsModal
                accountListId={accountListId}
                isOpen={true}
                handleClose={handleClose}
                contact={mockContact}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Contact' }),
      newContactName,
    );
    userEvent.click(getByRole('combobox', { hidden: true, name: 'Primary' }));
    userEvent.click(
      getByRole('option', { hidden: true, name: newPrimaryContactName }),
    );
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact updated successfully', {
        variant: 'success',
      }),
    );

    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.primaryPersonId).toEqual(
      mockContact.people.nodes[1].id,
    );
  });
});
