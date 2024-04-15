import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestRouter from '__tests__/util/TestRouter';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import theme from '../../../theme';
import { ContactFlow } from './ContactFlow';
import { GetUserOptionsQuery } from './GetUserOptions.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-1';

const router = {
  query: { accountListId, contactId: [contactId] },
};

const mocks = {
  GetUserOptions: {
    userOptions: [
      {
        id: 'test-id',
        key: 'contacts_view',
        value: 'flows',
      },
      {
        id: '551d0a2c-4c90-444c-97dc-11f4ca858e3c',
        key: 'flows',
        value:
          '[{"name":"UntitledOne","id":"6ced166a-d570-4086-af56-e3eeed8a1f98","statuses":["Appointment Scheduled","Not Interested"],"color":"color-text"},{"name":"UntitledTwo","id":"8a6bc2ed-820e-437b-81b8-36fbbe91f5e3","statuses":["Partner - Pray","Never Ask","Partner - Financial"],"color":"color-info"}]',
      },
    ],
  },
};

describe('ContactFlow', () => {
  it('Should show loading', async () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <ThemeProvider theme={theme}>
              <ContactsPage>
                <DndProvider backend={HTML5Backend}>
                  <ContactFlow
                    accountListId={accountListId}
                    getContactUrl={jest.fn()}
                    selectedFilters={{}}
                  />
                </DndProvider>
              </ContactsPage>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    await waitFor(() => expect(getByTestId('Loading')).toBeInTheDocument());
  });

  it('Should show flow options', async () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<{ GetUserOptions: GetUserOptionsQuery }>
            mocks={mocks}
          >
            <ThemeProvider theme={theme}>
              <ContactsPage>
                <DndProvider backend={HTML5Backend}>
                  <ContactFlow
                    accountListId={accountListId}
                    selectedFilters={{}}
                    getContactUrl={jest.fn()}
                  />
                </DndProvider>
              </ContactsPage>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('contactsFlow')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getByTestId('contactsFlowUntitledOne')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getByTestId('contactsFlowUntitledTwo')).toBeInTheDocument(),
    );
  });
});
