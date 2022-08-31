import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { SnackbarProvider } from 'notistack';
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
                    primaryPerson: { firstName: 'Fname', lastName: 'Lname' },
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
});
