import { ThemeProvider } from '@emotion/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { StaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import theme from 'src/theme';
import MPRemindersReportPage from './index.page';

const mutationSpy = jest.fn();

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};

const Components = () => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter>
        <GqlMockedProvider<{
          StaffAccount: StaffAccountQuery;
        }>
          mocks={mockStaffAccount}
          onCall={mutationSpy}
        >
          <MPRemindersReportPage />
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('MP Reminders Report Page', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('should show initial mp reminders report page', async () => {
    const { findByRole } = render(<Components />);

    expect(
      await findByRole('heading', { name: /online reminder system/i }),
    ).toBeInTheDocument();
  });

  it('should open and close menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<Components />);

    userEvent.click(
      await findByRole('button', { name: 'Toggle Navigation Panel' }),
    );
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Reports' })).not.toBeInTheDocument();
  });

  it('renders no staff account page when no staff account', async () => {
    const mockNoStaffAccount = {
      StaffAccount: {
        staffAccount: null,
      },
    };

    const { findByText } = render(
      <TestRouter>
        <GqlMockedProvider<{
          StaffAccount: StaffAccountQuery;
        }>
          mocks={mockNoStaffAccount}
          onCall={mutationSpy}
        >
          <MPRemindersReportPage />
        </GqlMockedProvider>
      </TestRouter>,
    );

    expect(
      await findByText(/access to this feature is limited/i),
    ).toBeInTheDocument();
  });
});
