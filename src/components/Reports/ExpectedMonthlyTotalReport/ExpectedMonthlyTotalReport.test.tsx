import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetExpectedMonthlyTotalsQuery } from 'pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from '../../../theme';
import { ExpectedMonthlyTotalReport } from './ExpectedMonthlyTotalReport';

const onNavListToggle = jest.fn();
const mutationSpy = jest.fn();

const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

const mockedDonations = {
  GetExpectedMonthlyTotals: {
    expectedMonthlyTotalReport: {
      currency: 'CAD',
      received: {
        donations: [
          {
            convertedCurrency: 'CAD',
            donationCurrency: 'CAD',
            pledgeCurrency: 'CAD',
          },
        ],
      },
      likely: {
        donations: [
          {
            convertedCurrency: 'CAD',
            donationCurrency: 'CAD',
            pledgeCurrency: 'CAD',
          },
        ],
      },
      unlikely: {
        donations: [
          {
            convertedCurrency: 'CAD',
            donationCurrency: 'CAD',
            pledgeCurrency: 'CAD',
          },
        ],
      },
    },
  },
};

const emptyMockedDonations = {
  GetExpectedMonthlyTotals: {
    expectedMonthlyTotalReport: {
      received: {
        donations: [],
      },
      likely: {
        donations: [],
      },
      unlikely: {
        donations: [],
      },
    },
  },
};

interface TestComponentProps {
  designationAccounts?: string[];
  empty?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  designationAccounts,
  empty,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        GetExpectedMonthlyTotals: GetExpectedMonthlyTotalsQuery;
      }>
        mocks={empty ? emptyMockedDonations : mockedDonations}
        onCall={mutationSpy}
      >
        <ContactPanelProvider>
          <ExpectedMonthlyTotalReport
            accountListId="abc"
            designationAccounts={designationAccounts}
            isNavListOpen
            onNavListToggle={onNavListToggle}
            title="test title"
          />
        </ContactPanelProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ExpectedMonthlyTotalReport', () => {
  it('renders with data', async () => {
    const { getAllByTestId, queryByRole, queryAllByRole } = render(
      <TestComponent />,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );

    expect(queryAllByRole('button')[0]).toBeInTheDocument();

    expect(getAllByTestId('donationColumn')[0]).toBeInTheDocument();
  });

  it('renders empty', async () => {
    const { getByText, queryByRole } = render(<TestComponent empty />);

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );

    expect(
      getByText('You have no expected donations this month'),
    ).toBeInTheDocument();
  });

  it('filters report by designation account', async () => {
    render(<TestComponent designationAccounts={['account-1']} />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GetExpectedMonthlyTotals', {
        designationAccountIds: ['account-1'],
      }),
    );
  });

  it('does not filter report by designation account', async () => {
    render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GetExpectedMonthlyTotals', {
        designationAccountIds: null,
      }),
    );
  });
  it('renders nav list icon and onclick triggers onNavListToggle', async () => {
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsFilterIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });
});
