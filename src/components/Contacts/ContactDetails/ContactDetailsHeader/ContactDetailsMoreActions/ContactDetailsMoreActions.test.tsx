import React from 'react';
import { InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { StatusEnum } from 'src/graphql/types.generated';
import useTaskModal from '../../../../../hooks/useTaskModal';
import theme from '../../../../../theme';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { UpdateContactOtherMutation } from '../../ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { ContactDetailsMoreActions } from './ContactDetailsMoreActions';

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
    preloadTaskModal: jest.fn(),
  });
});

describe('ContactDetailsMoreActions', () => {
  it('opens the referrals modal', async () => {
    const { getByRole, getByText, queryAllByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsMoreActions
                    status={StatusEnum.AskInFuture}
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    await waitFor(() =>
      expect(getByText('Add Connections')).toBeInTheDocument(),
    );
    userEvent.click(getByText('Add Connections'));
    await waitFor(() =>
      expect(queryAllByText('Add Connections')).toHaveLength(2),
    );
  });

  it('opens the task modal', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsMoreActions
                    status={StatusEnum.AskInFuture}
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
      view: TaskModalEnum.Add,
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
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsMoreActions
                    status={StatusEnum.AskInFuture}
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
      view: TaskModalEnum.Log,
      defaultValues: {
        contactIds: [contactId],
      },
    });
  });

  it('handles hiding contact', async () => {
    const { queryByText, getByRole, getByText, findByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              UpdateContactOther: UpdateContactOtherMutation;
            }>
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
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsMoreActions
                    status={StatusEnum.AskInFuture}
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
    userEvent.click(await findByText('Hide'));
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
            <GqlMockedProvider>
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsMoreActions
                    status={StatusEnum.AskInFuture}
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    expect(getByText('Add Connections')).toBeInTheDocument();
    expect(queryByText('Cancel')).not.toBeInTheDocument();
    userEvent.click(queryAllByText('Add Connections')[0]);
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
      findByText,
    } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsMoreActions
                    status={StatusEnum.AskInFuture}
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
    expect(await findByText('Cancel')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    await waitFor(() => expect(queryByText('Cancel')).not.toBeInTheDocument());
  });

  it('handles deleting contact', async () => {
    const cache = new InMemoryCache();
    const mockEvict = jest.fn();
    cache.evict = mockEvict;

    const { queryAllByText, queryByText, getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider cache={cache}>
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsMoreActions
                    status={StatusEnum.AskInFuture}
                    contactId={contactId}
                    onClose={onClose}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
    await waitFor(() =>
      userEvent.click(
        getByRole('button', { hidden: true, name: 'delete contact' }),
      ),
    );
    await waitFor(() =>
      expect(mockEvict).toHaveBeenCalledWith({ id: `Contact:${contactId}` }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
