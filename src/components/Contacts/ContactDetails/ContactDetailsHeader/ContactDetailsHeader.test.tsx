import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import theme from 'src/theme';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDetailsHeader } from './ContactDetailsHeader';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';

const accountListId = 'abc';
const contactId = 'contact-1';

const router = {
  query: { accountListId },
};

const mocks = {
  GetContactDetailsHeader: {
    contact: {
      name: 'Lname, Fname',
      avatar: `https://cru.org/assets/image.jpg`,
      primaryPerson: null,
      pledgeCurrency: 'USD',
      lastDonation: null,
    },
  },
};

describe('ContactDetails', () => {
  it('should show loading state', async () => {
    const { queryByTestId } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                    setContactDetailsLoaded={() => {}}
                    contactDetailsLoaded={false}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
            <GqlMockedProvider<{
              GetContactDetailsHeader: GetContactDetailsHeaderQuery;
            }>
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
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                    setContactDetailsLoaded={() => {}}
                    contactDetailsLoaded={false}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
            <GqlMockedProvider<{
              GetContactDetailsHeader: GetContactDetailsHeaderQuery;
            }>
              mocks={mocks}
            >
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                    setContactDetailsLoaded={() => {}}
                    contactDetailsLoaded={false}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
            <GqlMockedProvider<{
              GetContactDetailsHeader: GetContactDetailsHeaderQuery;
            }>
              mocks={mocks}
            >
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                    setContactDetailsLoaded={() => {}}
                    contactDetailsLoaded={false}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(getAllByLabelText('Edit Icon')[0]).toBeInTheDocument(),
    );
    userEvent.click(getAllByLabelText('Edit Icon')[0]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).toBeInTheDocument(),
    );
  });

  it('should close edit contact address modal', async () => {
    const { queryByText, getAllByLabelText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              GetContactDetailsHeader: GetContactDetailsHeaderQuery;
            }>
              mocks={mocks}
            >
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                    setContactDetailsLoaded={() => {}}
                    contactDetailsLoaded={false}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(getAllByLabelText('Edit Icon')[0]).toBeInTheDocument(),
    );
    userEvent.click(getAllByLabelText('Edit Icon')[0]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).toBeInTheDocument(),
    );
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).not.toBeInTheDocument(),
    );
  });
  it('should render avatar', async () => {
    const { queryByText, getAllByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              GetContactDetailsHeader: GetContactDetailsHeaderQuery;
            }>
              mocks={mocks}
            >
              <ContactsWrapper>
                <ContactDetailProvider>
                  <ContactDetailsHeader
                    accountListId={accountListId}
                    contactId={contactId}
                    onClose={() => {}}
                    setContactDetailsLoaded={() => {}}
                    contactDetailsLoaded={false}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(getAllByLabelText('Edit Icon')[0]).toBeInTheDocument(),
    );
    userEvent.click(getAllByLabelText('Edit Icon')[0]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).toBeInTheDocument(),
    );

    const avatarImage = document.querySelector('img') as HTMLImageElement;
    expect(avatarImage.src).toEqual('https://cru.org/assets/image.jpg');
    expect(avatarImage.alt).toEqual('Lname, Fname');
  });
});
