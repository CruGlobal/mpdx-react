import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';
import {
  render,
  waitFor,
} from '../../../../../../../__tests__/util/testingLibraryReactMock';
import TestRouter from '../../../../../../../__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import NavMenu from './NavMenu';
import { GetToolNotificationsQuery } from './GetToolNotifcations.generated';
import theme from 'src/theme';

const accountListId = 'test121';

const router = {
  query: { accountListId },
  isReady: true,
};

const routerHidden = {
  query: { accountListId: '' },
  isReady: true,
};

const routerAppeals = {
  query: { accountListId },
  isReady: true,
  pathname: '/accountLists/test/tools/appeals',
};

describe('NavMenu', () => {
  it('default', () => {
    const { getByRole, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <NavMenu />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(
      getByRole('menuitem', { hidden: true, name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Contacts' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Reports' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Tools' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Coaches' }),
    ).toBeInTheDocument();
    userEvent.click(getByTestId('ReportMenuToggle'));
    expect(
      getByRole('menuitem', { hidden: true, name: 'Donations' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Donations' }),
    ).toBeVisible();
    expect(
      getByRole('menuitem', {
        hidden: true,
        name: '14 Month Report',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Designation Accounts' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Responsibility Centers' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Expected Monthly Total' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Partner Giving Analysis' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Coaching' }),
    ).toBeInTheDocument();
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expect(
      getByRole('menuitem', { hidden: true, name: 'Appeal' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Commitment Info' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Mailing Addresses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Send Newsletter' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Merge Contacts' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Email Addresses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Phone Numbers' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Merge People' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Import from Google' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Import from TntConnect' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Import from CSV' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Donations' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', {
        hidden: true,
        name: '14 Month Report',
      }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Designation Accounts' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Responsibility Centers' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Expected Monthly Total' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Partner Giving Analysis' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Coaching' }),
    ).not.toBeVisible();
    expect(getByTestId('appeals-false')).toBeInTheDocument();
  });

  it('hidden', () => {
    const { queryByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={routerHidden}>
          <GqlMockedProvider>
            <NavMenu />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(queryByRole('menuitem')).toBeNull();
  });

  it('test current tool id hook', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={routerAppeals}>
          <GqlMockedProvider>
            <NavMenu />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expect(getByTestId('appeals-true')).toBeInTheDocument();
  });

  it('test notifications = 0', async () => {
    const { queryByTestId, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<GetToolNotificationsQuery>
            mocks={{
              GetToolNotifications: {
                contacts: {
                  totalCount: 0,
                },
                people: {
                  totalCount: 0,
                },
                contactDuplicates: {
                  totalCount: 0,
                },
                personDuplicates: {
                  totalCount: 0,
                },
              },
            }}
          >
            <NavMenu />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(queryByTestId('notificationTotal')).not.toBeInTheDocument(),
    );
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expect(getByTestId('appeals-false').firstChild).toHaveStyle('color: white');
    expect(getByTestId('appeals-false').children[1]).toHaveStyle(
      'color: white',
    );
    expect(
      queryByTestId('fixCommitmentInfo-notifications'),
    ).not.toBeInTheDocument();
  });

  it('test notifications > 0', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<GetToolNotificationsQuery>
            mocks={{
              GetToolNotifications: {
                contacts: {
                  totalCount: 1,
                },
                people: {
                  totalCount: 1,
                },
                contactDuplicates: {
                  totalCount: 1,
                },
                personDuplicates: {
                  totalCount: 1,
                },
              },
            }}
          >
            <NavMenu />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('notificationTotal')).toBeInTheDocument(),
    );
    expect(getByTestId('notificationTotalText')).toHaveTextContent('7');
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expect(getByTestId('fixCommitmentInfo-false').firstChild).toHaveStyle(
      'color: #383F43;',
    );
    expect(getByTestId('fixCommitmentInfo-false').children[1]).toHaveStyle(
      'color: #383F43;',
    );
    expect(getByTestId('fixCommitmentInfo-notifications')).toBeInTheDocument();
  });

  it('test notifications > 10', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<GetToolNotificationsQuery>
            mocks={{
              GetToolNotifications: {
                contacts: {
                  totalCount: 3,
                },
                people: {
                  totalCount: 3,
                },
                contactDuplicates: {
                  totalCount: 3,
                },
                personDuplicates: {
                  totalCount: 3,
                },
              },
            }}
          >
            <NavMenu />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('notificationTotal')).toBeInTheDocument(),
    );
    expect(getByTestId('notificationTotalText')).toHaveTextContent('9+');
  });
});
