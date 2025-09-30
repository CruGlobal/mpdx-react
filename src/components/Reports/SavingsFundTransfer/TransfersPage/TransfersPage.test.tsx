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
import {
  ReportsSavingsFundTransferQuery,
  ReportsStaffExpensesQuery,
} from '../ReportsSavingsFund.generated';
import { TransfersPage } from './TransfersPage';

const mutationSpy = jest.fn();
const mockEnqueue = jest.fn();
const onNavListToggle = jest.fn();

const mock = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
  ReportsSavingsFundTransfer: {
    reportsSavingsFundTransfer: [
      {
        id: '12345',
        amount: 2500,
        description: null,
        transactedAt: '2023-09-26T00:00:00+00:00',
        subCategory: {
          id: '1',
          name: 'deposit',
        },
        transfer: {
          sourceFundTypeName: 'Primary',
          destinationFundTypeName: 'Savings',
        },
        recurringTransfer: null,
      },
      {
        id: '67890',
        amount: 1200,
        description: null,
        transactedAt: '2023-09-30T00:00:00+00:00',
        subCategory: {
          id: '1',
          name: 'deposit',
        },
        transfer: {
          sourceFundTypeName: 'Primary',
          destinationFundTypeName: 'Savings',
        },
        recurringTransfer: {
          id: '1',
          recurringStart: '2023-09-30T00:00:00+00:00',
          recurringEnd: '2025-09-30T00:00:00+00:00',
          active: true,
        },
      },
    ],
  },
};

const emptyMock = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
  ReportsSavingsFundTransfer: {
    reportsSavingsFundTransfer: [],
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
              ReportsSavingsFundTransfer: ReportsSavingsFundTransferQuery;
              ReportsStaffExpenses: ReportsStaffExpensesQuery;
            }>
              mocks={mock}
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
      await findByText(mock.StaffAccount.staffAccount.name),
    ).toBeInTheDocument();
    expect(
      await findByText(mock.StaffAccount.staffAccount.id),
    ).toBeInTheDocument();
  });

  it('should render all balance cards with correct information', async () => {
    const { findByText } = render(<Components />);

    expect(await findByText('Primary Account Balance')).toBeInTheDocument();
    expect(await findByText('Savings Account Balance')).toBeInTheDocument();

    expect(await findByText('$15,000.00')).toBeInTheDocument();
    expect(await findByText('$25,000.00')).toBeInTheDocument();
  });

  it('should render cards and transfer history table', async () => {
    const { findByRole, findAllByRole } = render(<Components />);

    expect(
      await findAllByRole('button', { name: 'TRANSFER FROM' }),
    ).toHaveLength(2);
    expect(await findAllByRole('button', { name: 'TRANSFER TO' })).toHaveLength(
      2,
    );

    expect(await findByRole('grid')).toBeInTheDocument();
    expect(
      within(await findByRole('grid')).getAllByRole('columnheader'),
    ).toHaveLength(8);
  });

  it('should show empty state when no transfer history', async () => {
    const { findByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <TestRouter>
              <I18nextProvider i18n={i18n}>
                <GqlMockedProvider<{
                  ReportsSavingsFundTransfer: ReportsSavingsFundTransferQuery;
                  ReportsStaffExpenses: ReportsStaffExpensesQuery;
                }>
                  mocks={emptyMock}
                  onCall={mutationSpy}
                >
                  <MockStaffSavingFundProvider>
                    <TransfersPage title={'Empty Transfer History'} />
                  </MockStaffSavingFundProvider>
                </GqlMockedProvider>
              </I18nextProvider>
            </TestRouter>
          </LocalizationProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(
      await findByText('Transfer History not available'),
    ).toBeInTheDocument();
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
