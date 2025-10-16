import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { StaffAccountQuery } from '../StaffAccount.generated';
import { MPGAIncomeExpensesReport } from './MPGAIncomeExpensesReport';

const mutationSpy = jest.fn();
const onNavListToggle = jest.fn();

const title = 'MPGA Report';

const mockData = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider<{
        StaffAccount: StaffAccountQuery;
      }>
        mocks={mockData}
        onCall={mutationSpy}
      >
        <MPGAIncomeExpensesReport
          onNavListToggle={onNavListToggle}
          isNavListOpen={true}
          title={title}
        />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

const resizeObserverMock = () => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
beforeAll(() => {
  window.ResizeObserver = jest.fn().mockImplementation(resizeObserverMock);
});

beforeEach(() => {
  Object.defineProperty(window, 'print', {
    value: jest.fn(),
    writable: true,
    configurable: true,
  });
});

describe('MPGAIncomeExpensesReport', () => {
  it('renders data', async () => {
    const { getByRole, findByText } = render(<TestComponent />);
    expect(getByRole('heading', { name: title })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Print' })).toBeInTheDocument();

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
});
