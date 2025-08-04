import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { DonationTableQuery } from 'src/components/DonationTable/DonationTable.generated';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { GetDonationsGraphQuery } from '../../Contacts/ContactDetails/ContactDonationsTab/DonationsGraph/DonationsGraph.generated';
import { DonationsReport } from './DonationsReport';

const title = 'test title';
const onNavListToggle = jest.fn();
const mutationSpy = jest.fn();

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

const mocks = {
  GetDonationGraph: {
    accountList: {
      currency: 'CAD',
      monthlyGoal: 100,
      totalPledges: 10,
    },
    reportsDonationHistories: {
      averageIgnoreCurrent: 10,
      periods: [
        {
          startDate: DateTime.now().minus({ months: 12 }).toISO(),
          convertedTotal: 10,
          totals: [
            {
              currency: 'CAD',
              convertedAmount: 10,
            },
          ],
        },
        {
          startDate: DateTime.now().minus({ months: 11 }).toISO(),
          convertedTotal: 10,
          totals: [
            {
              currency: 'CAD',
              convertedAmount: 10,
            },
          ],
        },
      ],
    },
  },
  DonationTable: {
    donations: {
      nodes: [
        {
          amount: {
            convertedCurrency: 'CAD',
            currency: 'CAD',
          },
          donorAccount: {
            displayName: 'John',
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    },
  },
};

const emptyMocks = {
  ...mocks,
  GetDonationGraph: {
    ...mocks.GetDonationGraph,
    reportsDonationHistories: {
      ...mocks.GetDonationGraph.reportsDonationHistories,
      periods: [],
    },
  },
};

interface TestComponentProps {
  designationAccounts?: string[];
  empty?: boolean;
  routerMonth?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  designationAccounts,
  empty,
  routerMonth,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={
        routerMonth
          ? {
              ...router,
              query: { ...router.query, month: '2024-02-01' },
            }
          : router
      }
    >
      <GqlMockedProvider<{
        GetDonationsGraph: GetDonationsGraphQuery;
        DonationTable: DonationTableQuery;
      }>
        mocks={empty ? emptyMocks : mocks}
        onCall={mutationSpy}
      >
        <ContactPanelProvider>
          <DonationsReport
            accountListId={'abc'}
            designationAccounts={designationAccounts}
            isNavListOpen={true}
            onNavListToggle={onNavListToggle}
            title={title}
          />
        </ContactPanelProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('DonationsReport', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('renders empty', async () => {
    const {
      getByTestId,
      getByText,
      queryByRole,
      queryAllByRole,
      queryByTestId,
    } = render(<TestComponent empty />);

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );
    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
    expect(
      queryByTestId('DonationHistoriesGridLoading'),
    ).not.toBeInTheDocument();
    expect(queryAllByRole('button')[1]).toBeInTheDocument();
  });

  it('renders with data', async () => {
    const { getByTestId, findByRole, queryByRole, queryByTestId } = render(
      <TestComponent />,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );
    expect(
      getByTestId('DonationHistoriesTypographyAverage'),
    ).toBeInTheDocument();
    expect(
      queryByTestId('DonationHistoriesGridLoading'),
    ).not.toBeInTheDocument();
    expect(await findByRole('gridcell', { name: 'John' })).toBeInTheDocument();
  });

  it('initializes with month from query', () => {
    const { getByRole } = render(<TestComponent routerMonth="2024-02-01" />);

    expect(getByRole('heading', { name: 'February 2024' })).toBeInTheDocument();
  });

  it('filters report by designation account', async () => {
    render(<TestComponent designationAccounts={['account-1']} />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GetDonationGraph', {
        designationAccountIds: ['account-1'],
      }),
    );
  });

  it('does not filter report by designation account', async () => {
    render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GetDonationGraph', {
        designationAccountIds: null,
      }),
    );
  });

  it('renders nav list icon and onclick triggers onNavListToggle', async () => {
    onNavListToggle.mockClear();
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsFilterIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });
});
