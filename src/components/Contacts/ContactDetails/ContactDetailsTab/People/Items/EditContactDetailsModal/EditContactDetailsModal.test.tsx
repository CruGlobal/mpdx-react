import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../../theme';
import { EditContactDetailsModal } from './EditContactDetailsModal';
import { UpdateContactDetailsMutation } from './EditContactDetails.generated';

const handleClose = jest.fn();
const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc);
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

const mockContact: ContactPeopleFragment = {
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
};

describe('EditContactDetailsModal', () => {
  it('should render edit contact details modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactDetailsMutation>>
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
            <GqlMockedProvider<UpdateContactDetailsMutation>>
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
            <GqlMockedProvider<UpdateContactDetailsMutation>>
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
            <GqlMockedProvider<UpdateContactDetailsMutation>
              onCall={mutationSpy}
            >
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
    userEvent.click(getByRole('button', { hidden: true, name: 'Primary' }));
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
