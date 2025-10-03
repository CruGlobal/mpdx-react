import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { beforeTestResizeObserver } from '__tests__/util/windowResizeObserver';
import { GetUsersOrganizationsAccountsQuery } from 'src/components/Settings/integrations/Organization/Organizations.generated';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from '../../../GoalCalculatorTestWrapper';
import { GoalCalculationQuery } from '../../../Shared/GoalCalculation.generated';
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

const TestComponent: React.FC = () => (
  <GoalCalculatorTestWrapper>
    <GqlMockedProvider<{
      GoalCalculation: GoalCalculationQuery;
      GetUsersOrganizationsAccounts: GetUsersOrganizationsAccountsQuery;
      GetAccountList: GetAccountListQuery;
      GetOrganizations: GetOrganizationsQuery;
    }>
      mocks={{
        GoalCalculation: {
          goalCalculation: goalCalculationMock,
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
      <PresentingYourGoal />
    </GqlMockedProvider>
  </GoalCalculatorTestWrapper>
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
    expect(getByRole('cell', { name: 'Mission Agency' })).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Monthly Support Needs' }),
    ).toBeInTheDocument();

    expect(
      await findByRole('cell', { name: 'John and Jane Doe' }),
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

    await waitFor(() =>
      expect(container.querySelector('.recharts-pie')).toBeInTheDocument(),
    );

    const legend = container.querySelector('.recharts-legend-wrapper');
    expect(legend).toBeInTheDocument();
    expect(legend?.textContent).toMatch('Salary');
    expect(legend?.textContent).toMatch('Ministry Expenses');
    expect(legend?.textContent).toMatch('Benefits');
    expect(legend?.textContent).toMatch('Social Security and Taxes');
    expect(legend?.textContent).toMatch('Voluntary 403b Retirement Plan');
    expect(legend?.textContent).toMatch('Administrative Charge');
  });
});
