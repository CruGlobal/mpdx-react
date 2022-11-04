import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDetailsHeader } from './ContactDetailsHeader';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { ContactsPageProvider } from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';

const accountListId = 'abc';
const contactId = 'contact-1';

const router = {
  query: { accountListId },
};

describe('ContactDetails', () => {
  it('should show loading state', async () => {
    const { queryByTestId } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<GetContactDetailsHeaderQuery>>
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(queryByTestId('Skeleton')).toBeInTheDocument();
  });

  it('should render with contact details', async () => {
    const { findByText, queryByTestId } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<GetContactDetailsHeaderQuery>
              mocks={{
                GetContactDetailsHeader: {
                  contact: {
                    name: 'Fname Lname',
                    lastDonation: null,
                    pledgeCurrency: 'USD',
                  },
                },
              }}
            >
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(await findByText('Fname Lname')).toBeVisible();

    expect(queryByTestId('Skeleton')).toBeNull();
  });

  it('should render without primaryPerson', async () => {
    const { findByText, queryByTestId } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<GetContactDetailsHeaderQuery>
              mocks={{
                GetContactDetailsHeader: {
                  contact: {
                    name: 'Lname, Fname',
                    primaryPerson: null,
                    pledgeCurrency: 'USD',
                    lastDonation: null,
                  },
                },
              }}
            >
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(await findByText('Lname, Fname')).toBeVisible();

    expect(queryByTestId('Skeleton')).toBeNull();
  });

  it('should open edit contact details modal', async () => {
    const { queryByText, getAllByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<GetContactDetailsHeaderQuery>
              mocks={{
                GetContactDetailsHeader: {
                  contact: {
                    name: 'Lname, Fname',
                    primaryPerson: null,
                    pledgeCurrency: 'USD',
                    lastDonation: null,
                  },
                },
              }}
            >
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => {
      expect(queryByText('Loading')).not.toBeInTheDocument();
      userEvent.click(getAllByLabelText('Edit Icon')[0]);
    });
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).toBeInTheDocument(),
    );
  });

  it('should close edit contact address modal', async () => {
    const { queryByText, getAllByLabelText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<GetContactDetailsHeaderQuery>
              mocks={{
                GetContactDetailsHeader: {
                  contact: {
                    name: 'Lname, Fname',
                    primaryPerson: null,
                    pledgeCurrency: 'USD',
                    lastDonation: null,
                  },
                },
              }}
            >
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                  />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => {
      expect(queryByText('Loading')).not.toBeInTheDocument();
      userEvent.click(getAllByLabelText('Edit Icon')[0]);
    });
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).toBeInTheDocument(),
    );
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).not.toBeInTheDocument(),
    );
  });
});
