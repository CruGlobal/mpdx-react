import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import TestRouter from '../../../../../../__tests__/util/TestRouter';
import theme from '../../../../../theme';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { DeleteContactMutation } from '../../ContactDetailsTab/ContactDetailsTab.generated';
import useTaskModal from '../../../../../hooks/useTaskModal';
import { UpdateContactOtherMutation } from '../../ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsMoreAcitions } from './ContactDetailsMoreActions';
import { ContactsPageProvider } from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';

const accountListId = '111';
const contactId = 'contact-1';
const router = {
  query: { searchTerm: undefined, accountListId: accountListId },
  push: jest.fn(),
};
const onClose = jest.fn();

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

jest.mock('../../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});

describe('ContactDetailsMoreActions', () => {
  it('opens the referrals modal', async () => {
    const { getByRole, getByText, queryAllByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsMoreAcitions
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    await waitFor(() => expect(getByText('Add Referrals')).toBeInTheDocument());
    userEvent.click(getByText('Add Referrals'));
    await waitFor(() =>
      expect(queryAllByText('Add Referrals')).toHaveLength(2),
    );
  });

  it('opens the task modal', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsMoreAcitions
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    await waitFor(() => expect(getByText('Add Task')).toBeInTheDocument());
    userEvent.click(getByText('Add Task'));
    expect(openTaskModal).toHaveBeenCalledWith({
      defaultValues: {
        contactIds: [contactId],
      },
    });
  });

  it('opens the task modal log form', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsMoreAcitions
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    await waitFor(() => expect(getByText('Log Task')).toBeInTheDocument());
    userEvent.click(getByText('Log Task'));
    expect(openTaskModal).toHaveBeenCalledWith({
      view: 'log',
      defaultValues: {
        contactIds: [contactId],
      },
    });
  });

  it('handles hiding contact', async () => {
    const { queryByText, getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactOtherMutation>
              mocks={{
                UpdateContactOther: {
                  updateContact: {
                    contact: {
                      id: contactId,
                    },
                  },
                },
              }}
            >
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsMoreAcitions
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    expect(getByText('Hide Contact')).toBeInTheDocument();
    userEvent.click(getByText('Hide Contact'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact hidden successfully!', {
        variant: 'success',
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('should close referral modal', async () => {
    const {
      queryByText,
      queryAllByText,
      getByLabelText,
      getByText,
      getByRole,
    } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<DeleteContactMutation>>
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsMoreAcitions
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    expect(getByText('Add Referrals')).toBeInTheDocument();
    expect(queryByText('Cancel')).not.toBeInTheDocument();
    userEvent.click(queryAllByText('Add Referrals')[0]);
    expect(getByText('Cancel')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    await waitFor(() => expect(queryByText('Cancel')).not.toBeInTheDocument());
  });

  it('should close delete modal', async () => {
    const {
      queryByText,
      queryAllByText,
      getByLabelText,
      getByText,
      getByRole,
    } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<DeleteContactMutation>>
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsMoreAcitions
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    expect(getByText('Delete Contact')).toBeInTheDocument();
    expect(queryByText('Cancel')).not.toBeInTheDocument();
    userEvent.click(queryAllByText('Delete Contact')[0]);
    expect(getByText('Cancel')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    await waitFor(() => expect(queryByText('Cancel')).not.toBeInTheDocument());
  });

  it('handles deleting contact', async () => {
    const { queryAllByText, queryByText, getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<DeleteContactMutation>>
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsMoreAcitions
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    expect(getByText('Delete Contact')).toBeInTheDocument();
    userEvent.click(queryAllByText('Delete Contact')[0]);
    userEvent.click(
      getByRole('button', { hidden: true, name: 'delete contact' }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
