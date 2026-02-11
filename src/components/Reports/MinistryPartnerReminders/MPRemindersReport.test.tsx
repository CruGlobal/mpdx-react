import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffAccountQuery } from '../StaffAccount.generated';
import { MPRemindersReport } from './MPRemindersReport';
import { MinistryPartnerRemindersQuery } from './MinistryPartnerRemindersQuery.generated';

const mutationSpy = jest.fn();
const onNavListToggle = jest.fn();
const title = 'Ministry Partner Reminders';
const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
};

const mocks = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
  GetUser: {
    user: {
      primaryDesignation: '09876',
    },
  },
  MinistryPartnerReminders: {
    ministryPartnerReminders: [
      {
        id: 'reminder1',
        designationId: 'designation1',
        donorName: 'Doe, John',
        donorId: 'donor1',
        donorAccountNumber: '01234567',
        lastGiftDate: '2023-01-15T00:00:00Z',
        lastReminderDate: '2023-02-15T00:00:00Z',
        frequency: MinistryPartnerReminderFrequencyEnum.NotReminded,
      },
    ],
  },
};

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <VirtuosoMockContext.Provider
      value={{ viewportHeight: 300, itemHeight: 100 }}
    >
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              StaffAccount: StaffAccountQuery;
              MinistryPartnerReminders: MinistryPartnerRemindersQuery;
              GetUser: GetUserQuery;
            }>
              mocks={mocks}
              onCall={mutationSpy}
            >
              <MPRemindersReport
                isNavListOpen={true}
                onNavListToggle={onNavListToggle}
                title={title}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </LocalizationProvider>
    </VirtuosoMockContext.Provider>
  </ThemeProvider>
);

beforeEach(() => {
  Object.defineProperty(window, 'print', {
    value: jest.fn(),
    writable: true,
    configurable: true,
  });
});

describe('MPRemindersReport', () => {
  it('should render header with custom title', async () => {
    const { getByText, findByText } = render(<TestComponent />);

    expect(getByText('Ministry Partner Reminders')).toBeInTheDocument();
    expect(await findByText('12345')).toBeInTheDocument();
    expect(await findByText('Test Account')).toBeInTheDocument();
  });

  it('should print', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Print' }));

    await waitFor(() => expect(window.print).toHaveBeenCalled());
  });

  it('renders nav list icon and onclick triggers onNavListToggle', async () => {
    onNavListToggle.mockClear();
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ReportsMenuIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsMenuIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });

  it('should show saved snackbar when save is clicked with no changes', async () => {
    mockEnqueue.mockClear();
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('No changes have been made', {
        variant: 'info',
      }),
    );
  });

  it('should render reminder data in table', async () => {
    const { findAllByText, getAllByText, getByText } = render(
      <TestComponent />,
    );

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('GetUser');
    });

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('MinistryPartnerReminders', {
        accountListId: 'account-list-1',
        designationNumber: '09876',
      });
    });

    const names = await findAllByText('Doe, John');
    expect(names).toHaveLength(2);
    expect(getAllByText('Jan 15, 2023')).toHaveLength(2);
    expect(getAllByText('Feb 15, 2023')).toHaveLength(2);
    expect(getByText('Not Reminded')).toBeInTheDocument();
  });

  it('should call update mutation when changing reminder status and clicking save', async () => {
    const { findAllByText, getByRole } = render(<TestComponent />);

    const names = await findAllByText('Doe, John');
    expect(names.length).toBeGreaterThan(0);

    const select = getByRole('combobox', { name: /reminder status/i });
    userEvent.click(select);

    const option = getByRole('option', { name: 'Monthly' });
    userEvent.click(option);

    const saveButton = getByRole('button', { name: 'Save' });
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateMinistryPartnerReminders',
        {
          input: {
            accountListId: 'account-list-1',
            designationNumber: '09876',
            updates: [
              {
                rowId: 'reminder1',
                statusCd: MinistryPartnerReminderFrequencyEnum.Monthly,
              },
            ],
          },
        },
      );
      expect(mockEnqueue).toHaveBeenCalledWith('Changes saved', {
        variant: 'success',
      });
    });
  });
});
