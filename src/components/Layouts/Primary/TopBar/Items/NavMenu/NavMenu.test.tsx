import { NextRouter } from 'next/router';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { LoadCoachingListQuery } from 'src/components/Coaching/LoadCoachingList.generated';
import theme from 'src/theme';
import { GetToolNotificationsQuery } from './GetToolNotifcations.generated';
import NavMenu from './NavMenu';

const accountListId = 'test121';

interface TestComponentProps {
  router?: Partial<NextRouter>;
  mocks?: ApolloErgonoMockMap &
    DeepPartial<{
      GetToolNotifications: GetToolNotificationsQuery;
      LoadCoachingList: LoadCoachingListQuery;
    }>;
}

const TestComponent: React.FC<TestComponentProps> = ({ router, mocks }) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: { accountListId },
        isReady: true,
        ...router,
      }}
    >
      <GqlMockedProvider mocks={mocks}>
        <NavMenu />
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('NavMenu', () => {
  it('default', async () => {
    const { findByRole, getByRole, getByTestId } = render(
      <TestComponent
        mocks={{
          LoadCoachingList: {
            coachingAccountLists: {
              totalCount: 1,
            },
          },
        }}
      />,
    );
    expect(getByRole('menuitem', { name: 'Dashboard' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Contacts' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Reports' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Tools' })).toBeInTheDocument();
    userEvent.click(getByTestId('ReportMenuToggle'));
    expect(getByRole('menuitem', { name: 'Donations' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Donations' })).toBeVisible();
    expect(
      getByRole('menuitem', { name: '12 Month Partner Report' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: '12 Month Salary Report' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Designation Accounts' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Responsibility Centers' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Expected Monthly Total' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Partner Giving Analysis' }),
    ).toBeInTheDocument();
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expect(getByRole('menuitem', { name: 'Appeals' })).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Fix Commitment Info' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Fix Mailing Addresses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Fix Send Newsletter' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Merge Contacts' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Fix Email Addresses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Fix Phone Numbers' }),
    ).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Merge People' })).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Import from Google' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Import from TntConnect' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Import from CSV' }),
    ).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Donations' })).not.toBeVisible();
    expect(
      getByRole('menuitem', { name: '12 Month Partner Report' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { name: '12 Month Salary Report' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { name: 'Designation Accounts' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { name: 'Responsibility Centers' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { name: 'Expected Monthly Total' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { name: 'Partner Giving Analysis' }),
    ).not.toBeVisible();
    expect(getByTestId('appeals-false')).toBeInTheDocument();
    expect(
      await findByRole('menuitem', { name: 'Coaching' }),
    ).toBeInTheDocument();
  });
  it('does not show coaching link if there are no coaching accounts', async () => {
    const { queryByRole } = render(
      <TestComponent
        mocks={{
          LoadCoachingList: {
            coachingAccountLists: {
              totalCount: 0,
              nodes: [],
            },
          },
        }}
      />,
    );
    await waitFor(() =>
      expect(
        queryByRole('menuitem', { hidden: true, name: 'Coaching' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('hidden', () => {
    const { queryByRole } = render(
      <TestComponent router={{ query: { accountListId: '' } }} />,
    );
    expect(queryByRole('menuitem')).toBeNull();
  });

  describe("What's New link", () => {
    it('is visible when HELP_WHATS_NEW_URL is set', () => {
      process.env.HELP_WHATS_NEW_URL = '/new';
      process.env.HELP_WHATS_NEW_IMAGE_URL = '/img.png';

      const { getByRole } = render(<TestComponent />);

      expect(
        getByRole('menuitem', { name: "Help logo What's New" }),
      ).toHaveAttribute('href', '/new');
    });

    it('is hidden when HELP_WHATS_NEW_URL is not set', () => {
      process.env.HELP_WHATS_NEW_URL = '';

      const { queryByRole } = render(<TestComponent />);

      expect(
        queryByRole('menuitem', { name: "Help logo What's New" }),
      ).not.toBeInTheDocument();
    });
  });

  it('test current tool id hook', () => {
    const { getByTestId } = render(
      <TestComponent
        router={{
          query: { accountListId },
          pathname: '/accountLists/test/tools/appeals',
        }}
      />,
    );
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expect(getByTestId('appeals-true')).toBeInTheDocument();
  });

  it('test notifications = 0', async () => {
    const { queryByTestId, getByTestId } = render(
      <TestComponent
        mocks={{
          GetToolNotifications: {
            fixCommitmentInfo: { totalCount: 0 },
            fixMailingAddresses: { totalCount: 0 },
            fixSendNewsletter: { totalCount: 0 },
            fixEmailAddresses: { totalCount: 0 },
            fixPhoneNumbers: { totalCount: 0 },
            mergeContacts: { totalCount: 0 },
            mergePeople: { totalCount: 0 },
          },
        }}
      />,
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
      <TestComponent
        mocks={{
          GetToolNotifications: {
            fixCommitmentInfo: { totalCount: 1 },
            fixMailingAddresses: { totalCount: 1 },
            fixSendNewsletter: { totalCount: 1 },
            fixEmailAddresses: { totalCount: 1 },
            fixPhoneNumbers: { totalCount: 1 },
            mergeContacts: { totalCount: 1 },
            mergePeople: { totalCount: 1 },
          },
        }}
      />,
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

  it('test notifications > 99', async () => {
    const { getByTestId } = render(
      <TestComponent
        mocks={{
          GetToolNotifications: {
            fixCommitmentInfo: { totalCount: 30 },
            fixMailingAddresses: { totalCount: 30 },
            fixSendNewsletter: { totalCount: 30 },
            fixEmailAddresses: { totalCount: 30 },
            fixPhoneNumbers: { totalCount: 30 },
            mergeContacts: { totalCount: 130 },
            mergePeople: { totalCount: 30 },
          },
        }}
      />,
    );

    await waitFor(() =>
      expect(getByTestId('notificationTotal')).toBeInTheDocument(),
    );
    expect(getByTestId('notificationTotalText')).toHaveTextContent('99+');
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expect(getByTestId('mergeContacts-notifications')).toHaveTextContent('99+');
  });
});
