import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import theme from '../../../theme';
import { ContactFlow } from './ContactFlow';
import { GetUserOptionsQuery } from './GetUserOptions.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-1';

const router = {
  query: { accountListId, contactId: [contactId] },
};

const mocks = {
  UserOption: {
    userOption: {
      key: 'flows',
      value:
        '[{"name":"UntitledOne","id":"6ced166a-d570-4086-af56-e3eeed8a1f98","statuses":["Appointment Scheduled","Not Interested"],"color":"color-text"},{"name":"UntitledTwo","id":"8a6bc2ed-820e-437b-81b8-36fbbe91f5e3","statuses":["Partner - Pray","Never Ask","Partner - Financial"],"color":"color-info"}]',
    },
  },
};

const scrollHintText = 'Scroll sideways to see more columns.';

const singleColumnMocks = {
  UserOption: {
    userOption: {
      key: 'flows',
      value:
        '[{"name":"UntitledOne","id":"6ced166a-d570-4086-af56-e3eeed8a1f98","statuses":["Appointment Scheduled","Not Interested"],"color":"color-text"}]',
    },
  },
};

interface TestComponentProps {
  userOptionMocks: {
    UserOption: { userOption: { key: string; value: string } | null };
  };
}

const TestComponent: React.FC<TestComponentProps> = ({ userOptionMocks }) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <GqlMockedProvider<{ UserOption: UserOptionQuery }>
        mocks={userOptionMocks}
      >
        <ThemeProvider theme={theme}>
          <ContactsWrapper>
            <DndProvider backend={HTML5Backend}>
              <ContactFlow accountListId={accountListId} />
            </DndProvider>
          </ContactsWrapper>
        </ThemeProvider>
      </GqlMockedProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ContactFlow', () => {
  it('Should show loading', async () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <ThemeProvider theme={theme}>
              <ContactsWrapper>
                <DndProvider backend={HTML5Backend}>
                  <ContactFlow accountListId={accountListId} />
                </DndProvider>
              </ContactsWrapper>
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
              <ContactsWrapper>
                <DndProvider backend={HTML5Backend}>
                  <ContactFlow accountListId={accountListId} />
                </DndProvider>
              </ContactsWrapper>
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

  it('shows the default flow values if no values are saved', async () => {
    const { queryByTestId, getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<{ GetUserOptions: GetUserOptionsQuery }>
            mocks={{
              UserOption: {
                userOption: null,
              },
            }}
          >
            <ThemeProvider theme={theme}>
              <ContactsWrapper>
                <DndProvider backend={HTML5Backend}>
                  <ContactFlow accountListId={accountListId} />
                </DndProvider>
              </ContactsWrapper>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(queryByTestId('contactsFlowUntitledOne')).not.toBeInTheDocument(),
    );
    await waitFor(() => {
      expect(getByRole('heading', { name: 'Connection' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Initiation' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Appointment' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Follow-Up' })).toBeInTheDocument();
      expect(
        getByRole('heading', { name: 'Partner Care' }),
      ).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Archive' })).toBeInTheDocument();
    });
  });

  describe('sideways scroll cue', () => {
    it('shows the scroll hint when there is more than one column', async () => {
      const { findByTestId, getByText } = render(
        <TestComponent userOptionMocks={mocks} />,
      );

      expect(await findByTestId('contactsFlowUntitledTwo')).toBeInTheDocument();
      expect(getByText(scrollHintText)).toBeInTheDocument();
    });

    it('shows the scroll hint for the default columns', async () => {
      const { findByRole, getByText } = render(
        <TestComponent
          userOptionMocks={{ UserOption: { userOption: null } }}
        />,
      );

      expect(
        await findByRole('heading', { name: 'Archive' }),
      ).toBeInTheDocument();
      expect(getByText(scrollHintText)).toBeInTheDocument();
    });

    it('does not show the scroll hint when there is only one column', async () => {
      const { findByTestId, queryByText } = render(
        <TestComponent userOptionMocks={singleColumnMocks} />,
      );

      expect(await findByTestId('contactsFlowUntitledOne')).toBeInTheDocument();
      expect(queryByText(scrollHintText)).not.toBeInTheDocument();
    });

    it('snaps the board one column at a time on phones', async () => {
      const { findByTestId, getByTestId } = render(
        <TestComponent userOptionMocks={mocks} />,
      );

      // Wait for the saved columns, not the defaults shown while they load
      const firstColumn = await findByTestId('contactsFlowUntitledOne');
      const secondColumn = getByTestId('contactsFlowUntitledTwo');
      expect(
        getStyleAtWidth(
          getByTestId('contactsFlow'),
          'scroll-snap-type',
          phoneWidth,
        ),
      ).toBe('x mandatory');
      expect(
        getStyleAtWidth(firstColumn, 'scroll-snap-align', phoneWidth),
      ).toBe('start');
      expect(
        getStyleAtWidth(secondColumn, 'scroll-snap-align', phoneWidth),
      ).toBe('start');
    });

    it('does not snap the board on desktop', async () => {
      const { findByTestId, getByTestId } = render(
        <TestComponent userOptionMocks={mocks} />,
      );

      expect(await findByTestId('contactsFlowUntitledOne')).toBeInTheDocument();
      // An unset scroll-snap-type falls back to its initial value, none
      expect(
        getStyleAtWidth(
          getByTestId('contactsFlow'),
          'scroll-snap-type',
          desktopWidth,
        ) || 'none',
      ).toBe('none');
    });
  });
});
