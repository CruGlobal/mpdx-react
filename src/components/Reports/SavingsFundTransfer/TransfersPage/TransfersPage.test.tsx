import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { StaffAccountQuery } from '../../StaffAccount.generated';
import { StaffSavingFundContext } from '../../StaffSavingFund/StaffSavingFundContext';
import { mockData } from '../mockData';
import { TransfersPage } from './TransfersPage';

const mutationSpy = jest.fn();
const mockEnqueue = jest.fn();
const onNavListToggle = jest.fn();

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};

const MockStaffSavingFundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <StaffSavingFundContext.Provider
    value={{
      isNavListOpen: false,
      onNavListToggle: onNavListToggle,
    }}
  >
    {children}
  </StaffSavingFundContext.Provider>
);

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

const Components = ({
  title = 'Staff Savings Fund Transfers',
}: {
  title?: string;
}) => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <TestRouter>
          <I18nextProvider i18n={i18n}>
            <GqlMockedProvider<{
              StaffAccount: StaffAccountQuery;
            }>
              mocks={mockStaffAccount}
              onCall={mutationSpy}
            >
              <MockStaffSavingFundProvider>
                <TransfersPage title={title} />
              </MockStaffSavingFundProvider>
            </GqlMockedProvider>
          </I18nextProvider>
        </TestRouter>
      </LocalizationProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('TransfersPage', () => {
  it('should render with custom title', () => {
    const customTitle = 'Custom Transfer Page Title';
    const { getByText } = render(<Components title={customTitle} />);

    expect(getByText(customTitle)).toBeInTheDocument();
  });

  it('should render the page with header, title, and account information', async () => {
    const { getByText, findByText } = render(<Components />);

    expect(getByText('Staff Savings Fund Transfers')).toBeInTheDocument();
    expect(getByText('Fund Transfer')).toBeInTheDocument();

    expect(
      await findByText(mockStaffAccount.StaffAccount.staffAccount.name),
    ).toBeInTheDocument();
    expect(
      await findByText(mockStaffAccount.StaffAccount.staffAccount.id),
    ).toBeInTheDocument();
  });

  it('should render all balance cards with correct information', () => {
    const { getByText, getAllByText } = render(<Components />);

    expect(getByText('Staff Account Balance')).toBeInTheDocument();
    expect(getByText('Staff Conference Savings Balance')).toBeInTheDocument();
    expect(getByText('Staff Savings Balance')).toBeInTheDocument();

    expect(getAllByText('$15,000.00').length).toBeGreaterThan(0);
    expect(getAllByText('$500.00').length).toBeGreaterThan(0);
    expect(getAllByText('$2,500.00').length).toBeGreaterThan(0);
  });

  it('should render cards and transfer history table', () => {
    const { getByRole, getAllByRole } = render(<Components />);

    expect(getAllByRole('button', { name: 'TRANSFER FROM' })).toHaveLength(3);
    expect(getAllByRole('button', { name: 'TRANSFER TO' })).toHaveLength(3);

    expect(getByRole('grid')).toBeInTheDocument();
    expect(within(getByRole('grid')).getAllByRole('columnheader')).toHaveLength(
      8,
    );
  });

  it('should show empty state when no transfer history', () => {
    const originalHistory = mockData.history;
    mockData.history = [];

    const { getByText } = render(<Components />);

    expect(getByText('Transfer History not available')).toBeInTheDocument();

    mockData.history = originalHistory;
  });

  it('should open transfer modal when balance card transfer button is clicked', async () => {
    const { getByRole, getByText, getAllByRole } = render(<Components />);

    const transferButtons = getAllByRole('button', { name: /transfer/i });
    expect(transferButtons.length).toBeGreaterThan(0);

    const firstTransferButton = transferButtons[0].closest('button');
    expect(firstTransferButton).toBeTruthy();
    userEvent.click(firstTransferButton!);

    await waitFor(() => {
      expect(getByRole('dialog')).toBeInTheDocument();
      expect(getByText('New Fund Transfer')).toBeInTheDocument();
    });
  });

  it('should close transfer modal when close button is clicked', async () => {
    const { getByRole, queryByRole, getAllByRole } = render(<Components />);

    const transferButtons = getAllByRole('button', { name: /transfer/i });
    const firstTransferButton = transferButtons?.[0].closest('button');
    userEvent.click(firstTransferButton!);

    await waitFor(() => {
      expect(getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = getByRole('button', { name: /cancel/i });
    userEvent.click(cancelButton);

    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should display correct icons for different fund types', () => {
    const { getAllByRole } = render(<Components />);

    const svgIcons = getAllByRole('img', { hidden: true });
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  it('should handle navigation toggle', async () => {
    const { getByRole, getByTestId } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Staff Savings Fund Transfers' }),
    ).toBeTruthy();

    const navigationButton = getByRole('button', {
      name: 'Toggle Navigation Panel',
    });
    expect(navigationButton).toBeInTheDocument();
    userEvent.click(navigationButton);

    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsFilterIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });

  it('should display transfer modal with correct type', async () => {
    const { getByRole, getAllByRole } = render(<Components />);

    const transferButtons = getAllByRole('button', { name: /transfer/i });
    const firstTransferButton = transferButtons[0].closest('button');
    userEvent.click(firstTransferButton!);

    await waitFor(() => {
      const modal = getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    const fromAccount = getByRole('combobox', { name: /from account/i });
    const toAccount = getByRole('combobox', { name: /to account/i });

    expect(fromAccount).toBeInTheDocument();
    expect(toAccount).toBeInTheDocument();

    expect(
      within(fromAccount).getByText(mockData.funds[0].name, {
        selector: 'b',
      }),
    ).toBeInTheDocument();
    expect(
      within(toAccount).queryByText(mockData.funds[0].name, {
        selector: 'b',
      }),
    ).not.toBeInTheDocument();
  });
});
