import React, { PropsWithChildren, useState } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import useTaskModal from 'src/hooks/useTaskModal';
import theme from 'src/theme';
import {
  CoachingListCountDocument,
  CoachingListCountQuery,
} from '../CoachingListCount.generated';
import { GetTopBarQuery } from '../TopBar/GetTopBar.generated';
import { getTopBarMultipleMock } from '../TopBar/TopBar.mock';
import { NavBar } from './NavBar';

const router = {
  query: { accountListId: 'abc' },
  isReady: true,
  push: jest.fn(),
};

interface TestComponentProps {
  openMobile?: boolean;
  onSetupTour?: boolean;
  coachingCount?: number;
  coachingFails?: boolean;
}

const coachingListCountResult = jest.fn();

const coachingListCountMock = (
  totalCount: number,
  fails = false,
): MockedResponse => {
  const data: CoachingListCountQuery = {
    coachingAccountLists: { totalCount },
  };
  coachingListCountResult.mockReturnValue(
    fails ? { errors: [new GraphQLError('Coaching count failed')] } : { data },
  );
  return {
    request: { query: CoachingListCountDocument },
    result: coachingListCountResult,
  };
};

const TestComponent: React.FC<TestComponentProps> = ({
  openMobile = false,
  onSetupTour,
  coachingCount = 0,
  coachingFails = false,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <MockedProvider
        mocks={[...mocks, coachingListCountMock(coachingCount, coachingFails)]}
        addTypename={false}
      >
        <TestSetupProvider onSetupTour={onSetupTour}>
          <NavBar onMobileClose={onMobileClose} openMobile={openMobile} />
        </TestSetupProvider>
      </MockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const onMobileClose = jest.fn();
const mocks = [getTopBarMultipleMock()];
const openTaskModal = jest.fn();

jest.mock('src/hooks/useTaskModal');

const AddDialogProviders: React.FC<PropsWithChildren> = ({ children }) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <SnackbarProvider>
          <GqlMockedProvider<{ GetTopBar: GetTopBarQuery }>
            mocks={{ GetTopBar: { user: { developer: false } } }}
          >
            <TestSetupProvider>{children}</TestSetupProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>
    </ThemeProvider>
  </LocalizationProvider>
);

// Owns openMobile the way the primary layout does, so onMobileClose really closes the side menu
const SideMenuWithLayoutState: React.FC = () => {
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <AddDialogProviders>
      <button onClick={() => setOpenMobile(true)}>Open side menu</button>
      <NavBar
        openMobile={openMobile}
        onMobileClose={() => {
          onMobileClose();
          setOpenMobile(false);
        }}
      />
    </AddDialogProviders>
  );
};

// The drawer's exit transition and the dialogs' dynamic imports can take more than
// the default 1 second when many test suites run in parallel, as they do in CI
const slowUiWait = { timeout: 5000 };
const slowTestTimeout = 15000;

const renderAndOpenAddPanel = async () => {
  const utils = render(<SideMenuWithLayoutState />);

  userEvent.click(utils.getByRole('button', { name: 'Open side menu' }));
  expect(
    await utils.findByTestId('NavBarDrawer', undefined, slowUiWait),
  ).toBeInTheDocument();
  userEvent.click(utils.getByText('Add'));

  return utils;
};

const waitForSideMenuToClose = (
  queryByTestId: ReturnType<typeof render>['queryByTestId'],
) =>
  waitFor(
    () => expect(queryByTestId('NavBarDrawer')).not.toBeInTheDocument(),
    slowUiWait,
  );

describe('NavBar', () => {
  beforeEach(() => {
    (useTaskModal as jest.Mock).mockReturnValue({
      openTaskModal,
      preloadTaskModal: jest.fn(),
    });
  });

  it('default', () => {
    const { queryByTestId } = render(<TestComponent />);

    expect(queryByTestId('NavBarDrawer')).not.toBeInTheDocument();
  });

  it('opened', () => {
    const { getByRole, queryByTestId } = render(<TestComponent openMobile />);

    expect(queryByTestId('NavBarDrawer')).toBeInTheDocument();
    expect(getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('hides links during the setup tour', () => {
    const { queryByRole } = render(<TestComponent openMobile onSetupTour />);

    expect(queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('shows the Coaching link when the user coaches account lists', async () => {
    const { findByRole } = render(
      <TestComponent openMobile coachingCount={2} />,
    );

    expect(await findByRole('link', { name: 'Coaching' })).toBeInTheDocument();
  });

  it('hides the Coaching link when the user coaches no account lists', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent openMobile coachingCount={0} />,
    );

    await findByRole('link', { name: 'Dashboard' });
    await waitFor(() => expect(coachingListCountResult).toHaveBeenCalled());
    expect(queryByRole('link', { name: 'Coaching' })).not.toBeInTheDocument();
  });

  it('hides the Coaching link and keeps the nav when the coaching count fails', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent openMobile coachingFails />,
    );

    await waitFor(() => expect(coachingListCountResult).toHaveBeenCalled());
    expect(await findByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(queryByRole('link', { name: 'Coaching' })).not.toBeInTheDocument();
  });

  describe('Add menu', () => {
    beforeEach(() => {
      // Phone width, where the side menu is used
      matchMediaMock({ width: 390 });
    });

    it.each([
      ['Add Contact', 'New Contact'],
      ['Add Multiple Contacts', 'Add Multiple Contacts'],
      ['Add Donation', 'Add Donation'],
    ])(
      '%s closes the side menu and keeps its dialog open',
      async (menuItem, dialogTitle) => {
        const { findByRole, getByRole, queryByTestId } =
          await renderAndOpenAddPanel();

        userEvent.click(
          await findByRole('button', { name: menuItem }, slowUiWait),
        );

        expect(onMobileClose).toHaveBeenCalledTimes(1);
        expect(
          await findByRole('dialog', { name: dialogTitle }, slowUiWait),
        ).toBeInTheDocument();
        await waitForSideMenuToClose(queryByTestId);
        expect(getByRole('dialog', { name: dialogTitle })).toBeInTheDocument();
      },
      slowTestTimeout,
    );

    it(
      'closes the New Contact dialog with Cancel after the side menu closes',
      async () => {
        const { findByRole, queryByRole, queryByTestId } =
          await renderAndOpenAddPanel();

        userEvent.click(
          await findByRole('button', { name: 'Add Contact' }, slowUiWait),
        );
        await findByRole('dialog', { name: 'New Contact' }, slowUiWait);
        await waitForSideMenuToClose(queryByTestId);

        userEvent.click(
          await findByRole('button', { name: 'Cancel' }, slowUiWait),
        );

        await waitFor(
          () =>
            expect(
              queryByRole('dialog', { name: 'New Contact' }),
            ).not.toBeInTheDocument(),
          slowUiWait,
        );
        expect(queryByTestId('NavBarDrawer')).not.toBeInTheDocument();
      },
      slowTestTimeout,
    );

    it(
      'closes the Add Donation dialog with the close button after the side menu closes',
      async () => {
        const { findByRole, getByRole, queryByRole, queryByTestId } =
          await renderAndOpenAddPanel();

        userEvent.click(
          await findByRole('button', { name: 'Add Donation' }, slowUiWait),
        );
        await findByRole('dialog', { name: 'Add Donation' }, slowUiWait);
        await waitForSideMenuToClose(queryByTestId);

        userEvent.click(getByRole('button', { name: 'Close' }));

        await waitFor(
          () =>
            expect(
              queryByRole('dialog', { name: 'Add Donation' }),
            ).not.toBeInTheDocument(),
          slowUiWait,
        );
      },
      slowTestTimeout,
    );

    it(
      'keeps the Add dialog open when the side menu is closed and unmounts its contents',
      async () => {
        const { findByRole, getByRole, getByText, queryByTestId, rerender } =
          render(
            <AddDialogProviders>
              <NavBar onMobileClose={onMobileClose} openMobile />
            </AddDialogProviders>,
          );

        userEvent.click(getByText('Add'));
        userEvent.click(
          await findByRole('button', { name: 'Add Contact' }, slowUiWait),
        );
        expect(
          await findByRole('dialog', { name: 'New Contact' }, slowUiWait),
        ).toBeInTheDocument();

        rerender(
          <AddDialogProviders>
            <NavBar onMobileClose={onMobileClose} openMobile={false} />
          </AddDialogProviders>,
        );

        await waitForSideMenuToClose(queryByTestId);
        expect(
          getByRole('dialog', { name: 'New Contact' }),
        ).toBeInTheDocument();
      },
      slowTestTimeout,
    );

    it.each([
      ['Add Task', TaskModalEnum.Add],
      ['Log Task', TaskModalEnum.Log],
    ])(
      '%s closes the side menu and opens the task modal',
      async (menuItem, view) => {
        const { findByRole, queryByTestId } = await renderAndOpenAddPanel();

        userEvent.click(
          await findByRole('button', { name: menuItem }, slowUiWait),
        );

        expect(openTaskModal).toHaveBeenCalledWith({ view });
        expect(onMobileClose).toHaveBeenCalledTimes(1);
        await waitForSideMenuToClose(queryByTestId);
      },
      slowTestTimeout,
    );
  });
});
