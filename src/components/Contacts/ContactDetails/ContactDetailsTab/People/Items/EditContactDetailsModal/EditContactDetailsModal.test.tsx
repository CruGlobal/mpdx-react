import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GraphQLError } from 'graphql';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import { ContactDetailsTabQuery } from '../../../ContactDetailsTab.generated';
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
const accountListEd = 'abc';

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

const mockContact: ContactDetailsTabQuery['contact'] = {
  name: 'test person',
  id: contactId,
  tagList: [],
  people: mock.people,
  primaryPerson: mock.primaryPerson,
};

describe('EditContactDetailsModal', () => {
  it('should render edit contact details modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactDetailsMutation>>
              <EditContactDetailsModal
                accountListId={accountListEd}
                isOpen={true}
                handleClose={handleClose}
                contact={mockContact}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Details')).toBeInTheDocument();
  });

  it('should close edit contact details modal', () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactDetailsMutation>>
              <EditContactDetailsModal
                accountListId={accountListEd}
                isOpen={true}
                handleClose={handleClose}
                contact={mockContact}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactDetailsMutation>>
              <EditContactDetailsModal
                accountListId={accountListEd}
                isOpen={true}
                handleClose={handleClose}
                contact={mockContact}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should edit contact details', async () => {
    const newContactName = 'Guy, Cool and Neat';
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactDetailsMutation>>
              <EditContactDetailsModal
                accountListId={accountListEd}
                isOpen={true}
                handleClose={handleClose}
                contact={mockContact}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.type(getByRole('textbox', { name: 'Contact' }), newContactName);
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact updated successfully', {
        variant: 'success',
      }),
    );
  });

  it('should handle errors with editing contact details', async () => {
    const newContactName = 'Guy, Cool and Neat';
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactDetailsMutation>
              mocks={{
                UpdateContactDetails: {
                  updateContact: {
                    contact: new GraphQLError(
                      'GraphQL Error #42:  Error updating contact.',
                    ),
                  },
                },
              }}
            >
              <EditContactDetailsModal
                accountListId={accountListEd}
                isOpen={true}
                handleClose={handleClose}
                contact={mockContact}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.type(getByRole('textbox', { name: 'Contact' }), newContactName);
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'GraphQL Error #42:  Error updating contact.',
        {
          variant: 'error',
        },
      ),
    );
  });
});
