import { ThemeProvider } from '@emotion/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { StaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import theme from 'src/theme';
import MonthlyDonationReportPage from './[[...contactId]].page';

const mutationSpy = jest.fn();

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};
interface ComponentsProps {
  routerHasContactId?: boolean;
  routerHasSearchTerm?: boolean;
}

const Components: React.FC<ComponentsProps> = ({
  routerHasContactId = false,
}) => {
  const router = {
    query: {
      contactId: routerHasContactId
        ? ['00000000-0000-0000-0000-000000000000']
        : undefined,
    },
    isReady: true,
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{
          StaffAccount: StaffAccountQuery;
        }>
          mocks={mockStaffAccount}
          onCall={mutationSpy}
        >
          <MonthlyDonationReportPage />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('Monthly Donation Report Page', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('should show initial monthly donation report page', async () => {
    const { findByText } = render(<Components />);

    expect(await findByText(/my donations/i)).toBeInTheDocument();
  });

  it('should open and close  menu', async () => {
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
          <MonthlyDonationReportPage />
        </GqlMockedProvider>
      </TestRouter>,
    );

    expect(
      await findByText(/access to this feature is limited/i),
    ).toBeInTheDocument();
  });

  it('renders contact panel', async () => {
    const { findByRole } = render(<Components routerHasContactId />);

    expect(await findByRole('tab', { name: 'Tasks' })).toBeInTheDocument();
  });
});
