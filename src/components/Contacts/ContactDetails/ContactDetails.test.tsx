import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import theme from '../../../theme';
import { ContactDetailProvider } from './ContactDetailContext';
import { ContactDetails } from './ContactDetails';

const accountListId = 'account-list-1';
const contactId = 'contact-1';

const router = {
  query: { accountListId, contactId: [contactId] },
};

describe('ContactDetails', () => {
  it('should change tab', async () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <ThemeProvider theme={theme}>
              <ContactsPage>
                <ContactDetailProvider>
                  <ContactDetails onClose={() => {}} />
                </ContactDetailProvider>
              </ContactsPage>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    const tasksPanel = getAllByRole('tabpanel')[0];
    expect(tasksPanel).toBeVisible();

    userEvent.click(getAllByRole('tab')[1]);
    expect(tasksPanel).not.toBeVisible();
  });
});
