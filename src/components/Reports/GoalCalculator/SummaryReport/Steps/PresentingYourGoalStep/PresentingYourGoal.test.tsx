import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { beforeTestResizeObserver } from '__tests__/util/windowResizeObserver';
import { GetUsersOrganizationsAccountsQuery } from 'src/components/Settings/integrations/Organization/Organizations.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import theme from 'src/theme';
import { GoalCalculatorProvider } from '../../../Shared/GoalCalculatorContext';
import { GetAccountListQuery } from './GetAccountList.generated';
import { GetOrganizationsQuery } from './GetOrganization.generated';
import { PresentingYourGoal } from './PresentingYourGoal';
/*
 * Mocking recharts ResponsiveContainer to avoid ResponsiveContainer
 * width and height issue
 * https://jskim1991.medium.com/react-writing-tests-with-graphs-9b7f2c9eeefc
 */
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

jest.mock('src/hooks/useOrganizationId', () => ({
  useOrganizationId: jest.fn(() => 'organization-id-1'),
}));

jest.mock('src/hooks/useAccountListId', () => ({
  useAccountListId: jest.fn(() => 'account-list-id-1'),
}));

const TestComponent: React.FC = () => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
        GetUsersOrganizationsAccounts: GetUsersOrganizationsAccountsQuery;
        GetAccountList: GetAccountListQuery;
        GetOrganizations: GetOrganizationsQuery;
      }>
        mocks={{
          GetUser: {
            user: {
              id: 'account-list-id-1',
              firstName: 'Obiwan',
              lastName: 'Kenobi',
            },
          },
          GetUsersOrganizationsAccounts: {
            userOrganizationAccounts: [
              {
                id: 'user-org-account-id-1',
                username: 'obiwan.kenobi',
                latestDonationDate: '2023-12-01',
                lastDownloadedAt: '2023-12-15',
                organization: {
                  id: 'organization-id-1',
                  name: 'Cru - United States of America',
                  apiClass: 'DataSync',
                  oauth: false,
                },
              },
            ],
          },
          GetAccountList: {
            accountList: {
              receivedPledges: 100,
            },
          },
          GetOrganizations: {
            organizations: [
              {
                id: 'organization-id-1',
                organizationType: 'Cru',
              },
            ],
          },
        }}
      >
        <GoalCalculatorProvider>
          <PresentingYourGoal />
        </GoalCalculatorProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('PresentingYourGoal', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  it('renders cell text and table headings', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);
    expect(
      getByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'User' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Mission Agency' })).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Monthly Support Needs' }),
    ).toBeInTheDocument();

    expect(
      await findByRole('cell', { name: 'Obiwan Kenobi' }),
    ).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'Cru - United States of America' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Orlando, FL' })).toBeInTheDocument();

    expect(
      getByRole('heading', { name: 'Monthly Support Breakdown' }),
    ).toBeInTheDocument();
  });

  it('renders the logo image when the user salary organization is Cru', async () => {
    const { findAllByRole, getByTestId } = render(<TestComponent />);
    await findAllByRole('img');
    const cruLogo = getByTestId('cru-logo');
    expect(cruLogo).toBeInTheDocument();
  });

  it('renders amount elements', () => {
    const { getAllByTestId } = render(<TestComponent />);
    expect(getAllByTestId('amount-typography').length).toBeGreaterThan(0);
  });

  it('renders the pie chart', async () => {
    const { container } = render(<TestComponent />);

    const chart = container.querySelector('.recharts-pie');
    expect(chart).toBeInTheDocument();

    const legend = container.querySelector('.recharts-legend-wrapper');
    expect(legend).toBeInTheDocument();
    expect(legend?.textContent).toMatch('Salary');
  });

  it('renders the legend with all pie chart categories', async () => {
    const { container } = render(<TestComponent />);
    const legend = container.querySelector('.recharts-legend-wrapper');
    expect(legend?.textContent).toMatch('Salary');
    expect(legend?.textContent).toMatch('Ministry Expenses');
    expect(legend?.textContent).toMatch('Benefits');
    expect(legend?.textContent).toMatch('Social Security and Taxes');
    expect(legend?.textContent).toMatch('Voluntary 403b Retirement Plan');
    expect(legend?.textContent).toMatch('Administrative Charge');
  });
});
