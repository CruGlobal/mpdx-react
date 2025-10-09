import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { StaffAccountQuery } from '../StaffAccount.generated';
import { MPRemindersReport } from './MPRemindersReport';

const mutationSpy = jest.fn();
const onNavListToggle = jest.fn();
const title = 'Ministry Partner Reminders';

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
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
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <TestRouter>
          <GqlMockedProvider<{
            StaffAccount: StaffAccountQuery;
          }>
            mocks={mockStaffAccount}
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

    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsFilterIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });

  it('should show saved snackbar when save is clicked', async () => {
    mockEnqueue.mockClear();
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Changes saved', {
        variant: 'success',
      }),
    );
  });
});
