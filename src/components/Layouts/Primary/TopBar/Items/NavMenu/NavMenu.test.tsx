import { NextRouter } from 'next/router';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { CoachingListCountQuery } from 'src/components/Layouts/Primary/CoachingListCount.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import theme from 'src/theme';
import { GetToolNotificationsQuery } from './GetToolNotifcations.generated';
import NavMenu from './NavMenu';

const accountListId = 'test121';
interface TestComponentProps {
  router?: Partial<NextRouter>;
  onCall?: jest.Mock;
  mocks?: ApolloErgonoMockMap &
    DeepPartial<{
      GetToolNotifications: GetToolNotificationsQuery;
      CoachingListCount: CoachingListCountQuery;
      GetUser: GetUserQuery;
      Hcm: HcmQuery;
      UserOption: UserOptionQuery;
    }>;
}

const TestComponent: React.FC<TestComponentProps> = ({
  router,
  mocks,
  onCall,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: { accountListId },
        isReady: true,
        ...router,
      }}
    >
      <GqlMockedProvider mocks={mocks} onCall={onCall}>
        <NavMenu />
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const coachingMocks = (totalCount: number) => ({
  CoachingListCount: { coachingAccountLists: { totalCount } },
});

const toolNotifications = (totalCount: number, mergeContacts = totalCount) => ({
  fixCommitmentInfo: { totalCount },
  fixMailingAddresses: { totalCount },
  fixSendNewsletter: { totalCount },
  fixEmailAddresses: { totalCount },
  fixPhoneNumbers: { totalCount },
  mergeContacts: { totalCount: mergeContacts },
  mergePeople: { totalCount },
});

const expectMenuItems = (
  getByRole: ReturnType<typeof render>['getByRole'],
  names: string[],
) =>
  names.forEach((name) =>
    expect(getByRole('menuitem', { name })).toBeInTheDocument(),
  );

const defaultMocks = {
  ...coachingMocks(1),
  GetUser: { user: { userType: UserTypeEnum.UsStaff } },
  GetToolNotifications: toolNotifications(0),
  UserOption: { userOption: { value: 'true' } },
};

describe('NavMenu', () => {
  it('renders top-level nav items and coaching link', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent mocks={defaultMocks} />,
    );
    expect(
      await findByRole('menuitem', { name: 'HR Tools' }),
    ).toBeInTheDocument();
    expectMenuItems(getByRole, [
      'Dashboard',
      'Contacts',
      'Reports',
      'MPDX Tools',
    ]);
    expect(
      await findByRole('menuitem', { name: 'Coaching' }),
    ).toBeInTheDocument();
  });

  it('renders Reports submenu items', async () => {
    const { findByRole, getByRole, getByTestId, queryByRole } = render(
      <TestComponent mocks={defaultMocks} />,
    );
    await findByRole('menuitem', { name: 'Reports' });
    userEvent.click(getByTestId('ReportMenuToggle'));
    expectMenuItems(getByRole, [
      'Donations',
      '14 Month Partner Report',
      '14 Month Salary Report',
      'Staff Expense Report',
      'Income/Expense Analysis',
      'Designation Accounts',
      'Expected Monthly Total',
      'Partner Giving Analysis',
    ]);
    expect(
      queryByRole('menuitem', { name: 'Responsibility Centers' }),
    ).not.toBeInTheDocument();
  });

  it('renders HR Tools submenu items', async () => {
    const { findByRole, getByRole, getByTestId } = render(
      <TestComponent
        mocks={{
          ...defaultMocks,
          GetUser: {
            user: {
              userType: UserTypeEnum.UsStaff,
              usStaffGroup: UsStaffGroupEnum.SeniorStaff,
              supervisesStaff: true,
            },
          },
        }}
      />,
    );
    expect(
      await findByRole('menuitem', { name: 'HR Tools' }),
    ).toBeInTheDocument();
    userEvent.click(getByTestId('HrToolsMenuToggle'));
    expectMenuItems(getByRole, [
      'Salary Calculation Form',
      'Savings Fund Transfer',
      'MPD Goal Calculator',
      'MHA Calculation Tool',
      'Additional Salary Request',
      'Ministry Partner Reminders',
      'MPD Supervisor Report',
    ]);
  });

  it('renders MPDX Tools submenu items', async () => {
    const { findByRole, getByRole, getByTestId } = render(
      <TestComponent mocks={defaultMocks} />,
    );
    await findByRole('menuitem', { name: 'MPDX Tools' });
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expectMenuItems(getByRole, [
      'Appeals',
      'Fix Commitment Info',
      'Fix Mailing Addresses',
      'Fix Send Newsletter',
      'Merge Contacts',
      'Fix Email Addresses',
      'Fix Phone Numbers',
      'Merge People',
      'Import from Google',
      'Import from TntConnect',
      'Import from CSV',
    ]);
    expect(getByTestId('appeals-false')).toBeInTheDocument();
  });

  it('shows only Partner Reminders in HR Tools when user type not verified', async () => {
    const { findByRole, getByRole, getByTestId, queryByRole } = render(
      <TestComponent
        mocks={{
          ...defaultMocks,
          GetUser: {
            user: {
              userType: UserTypeEnum.UsStaff,
              usStaffGroup: UsStaffGroupEnum.SeniorStaff,
            },
          },
          UserOption: {
            userOption: {
              value: '',
            },
          },
        }}
      />,
    );

    await findByRole('menuitem', { name: 'HR Tools' });
    userEvent.click(getByTestId('HrToolsMenuToggle'));

    // Partner Reminders is live regardless of verification, so the tab still shows
    expect(
      getByRole('menuitem', { name: 'Ministry Partner Reminders' }),
    ).toBeInTheDocument();

    expect(
      queryByRole('menuitem', { name: 'Salary Calculation Form' }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('menuitem', { name: 'MPD Goal Calculator' }),
    ).not.toBeInTheDocument();
  });

  it('shows coaching link if there are coaching accounts', async () => {
    const { findByRole } = render(<TestComponent mocks={coachingMocks(3)} />);
    expect(
      await findByRole('menuitem', { hidden: true, name: 'Coaching' }),
    ).toBeInTheDocument();
  });

  it('does not show coaching link if there are no coaching accounts', async () => {
    const mutationSpy = jest.fn();
    const { queryByRole } = render(
      <TestComponent mocks={coachingMocks(0)} onCall={mutationSpy} />,
    );
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CoachingListCount'),
    );
    expect(
      queryByRole('menuitem', { hidden: true, name: 'Coaching' }),
    ).not.toBeInTheDocument();
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
      <TestComponent mocks={{ GetToolNotifications: toolNotifications(0) }} />,
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
      <TestComponent mocks={{ GetToolNotifications: toolNotifications(1) }} />,
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
        mocks={{ GetToolNotifications: toolNotifications(30, 130) }}
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
