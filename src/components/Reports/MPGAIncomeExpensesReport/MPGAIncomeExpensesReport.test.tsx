import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MPGAIncomeExpensesReport } from './MPGAIncomeExpensesReport';

const mutationSpy = jest.fn();
const onNavListToggle = jest.fn();

const title = 'MPGA Report';
const mockData = {
  accountListId: '12345',
  accountName: 'Test Account',
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <MPGAIncomeExpensesReport
          accountListId={mockData.accountListId}
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
  (window as any).ResizeObserver = jest
    .fn()
    .mockImplementation(resizeObserverMock);
});

describe('MPGAIncomeExpensesReport', () => {
  it('renders data', () => {
    const { getByRole, getByText } = render(<TestComponent />);
    expect(getByRole('heading', { name: title })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Print' })).toBeInTheDocument();

    expect(getByText('12345')).toBeInTheDocument();
    expect(getByText('Test Account')).toBeInTheDocument();
  });

  it('renders nav list icon and onclick triggers onNavListToggle', async () => {
    onNavListToggle.mockClear();
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsFilterIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });
});
