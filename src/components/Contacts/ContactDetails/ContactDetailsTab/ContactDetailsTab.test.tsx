import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import theme from '../../../../theme';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDetailsTab } from './ContactDetailsTab';
import { ContactDetailsTabQuery } from './ContactDetailsTab.generated';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';

const accountListId = '111';
const contactId = 'contact-1';
const router = {
  query: { searchTerm: undefined, accountListId },
  push: jest.fn(),
};
const onContactSelected = jest.fn();

const mocks = {
  ContactDetailsTab: {
    contact: {
      id: contactId,
      name: 'Person, Test',
      addresses: {
        nodes: [
          {
            id: '123',
            street: '123 Sesame Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
            primaryMailingAddress: true,
          },
          {
            id: '321',
            street: '4321 Sesame Street',
            city: 'Florida',
            state: 'FL',
            postalCode: '10001',
            country: 'USA',
            primaryMailingAddress: false,
          },
        ],
      },
      tagList: ['tag1', 'tag2', 'tag3'],
      people: {
        nodes: [
          {
            id: contactId,
            firstName: 'Test',
            lastName: 'Person',
            primaryPhoneNumber: { number: '555-555-5555' },
            primaryEmailAddress: {
              email: 'testperson@fake.com',
            },
          },
        ],
      },
      website: 'testperson.com',
    },
  },
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

describe('ContactDetailTab', () => {
  it('should open edit person modal', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close edit person modal', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('Edit Person')).not.toBeInTheDocument(),
    );
  });

  it('should open create person modal', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close create person modal', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('Create Person')).not.toBeInTheDocument(),
    );
  });

  it('should open create address modal', async () => {
    const { queryByText, getByText, getAllByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(1));
    userEvent.click(getByText('Add Address'));
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(2));
  });

  it('should close create address modal', async () => {
    const { queryByText, getAllByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(1));
  });

  it('should open edit contact address modal', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close edit contact address modal', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('Edit Address')).not.toBeInTheDocument(),
    );
  });

  it('should open show more section | Addresses', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close show more section | Addresses', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('4321 Sesame Street')).not.toBeInTheDocument(),
    );
  });

  it('should open edit contact addresses from show more section | Addresses', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should open edit contact other details modal', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close edit contact other details modal', async () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTab
                      accountListId={accountListId}
                      contactId={contactId}
                      onContactSelected={onContactSelected}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('Edit Contact Other Details')).not.toBeInTheDocument(),
    );
  });
});
