import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { UpdatedAtProvider } from '../UpdatedAtContext/UpdateAtContext';
import { Fund, StaffSavingFundEnum } from '../mockData';
import { BalanceCard } from './BalanceCard';

const accountListId = 'abc';
const router = {
  query: { accountListId },
  isReady: true,
};

const mutationSpy = jest.fn();
const mockHandleOpenTransferModal = jest.fn();

const defaultFund: Fund = {
  accountId: crypto.randomUUID(),
  type: StaffSavingFundEnum.StaffAccount,
  name: 'Staff Account',
  balance: 15000,
};

interface ComponentsProps {
  fund?: Fund;
  isSelected?: boolean;
}

const Components = ({
  fund = defaultFund,
  isSelected = false,
}: ComponentsProps) => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <I18nextProvider i18n={i18n}>
          <GqlMockedProvider onCall={mutationSpy}>
            <UpdatedAtProvider>
              <BalanceCard
                fund={fund}
                handleOpenTransferModal={mockHandleOpenTransferModal}
                isSelected={isSelected}
              />
            </UpdatedAtProvider>
          </GqlMockedProvider>
        </I18nextProvider>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('BalanceCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the card with all required elements', () => {
    const { getByText, getByRole } = render(<Components />);

    expect(getByText('Staff Account Balance')).toBeInTheDocument();
    expect(getByText('Current Balance')).toBeInTheDocument();
    expect(getByText('$15,000.00')).toBeInTheDocument();
    expect(getByRole('button', { name: /transfer from/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /transfer to/i })).toBeInTheDocument();
  });

  it('should display title correctly', () => {
    const name = 'Custom Title';
    const { getByText } = render(
      <Components
        fund={{
          ...defaultFund,
          name,
        }}
      />,
    );

    expect(getByText(`${name} Balance`)).toBeInTheDocument();
  });

  describe('Icons', () => {
    it('should display savings icon', () => {
      const { getByTestId } = render(
        <Components
          fund={{
            ...defaultFund,
            type: StaffSavingFundEnum.StaffSavings,
          }}
        />,
      );

      expect(getByTestId('SavingsIcon')).toBeInTheDocument();
    });

    it('should display group icon', () => {
      const { getByTestId } = render(
        <Components
          fund={{
            ...defaultFund,
            type: StaffSavingFundEnum.StaffConferenceSavings,
          }}
        />,
      );

      expect(getByTestId('GroupsIcon')).toBeInTheDocument();
    });

    it('should display staff account icon', () => {
      const { getByTestId } = render(
        <Components
          fund={{
            ...defaultFund,
            type: StaffSavingFundEnum.StaffAccount,
          }}
        />,
      );

      expect(getByTestId('WalletIcon')).toBeInTheDocument();
    });
  });

  describe('Handle formatting', () => {
    it('should format balance amount correctly', () => {
      const { getByText } = render(
        <Components
          fund={{
            ...defaultFund,
            balance: 1234567.89,
          }}
        />,
      );

      expect(getByText('$1,234,567.89')).toBeInTheDocument();
    });

    it('should handle zero balance amount', () => {
      const { getAllByText } = render(
        <Components
          fund={{
            ...defaultFund,
            balance: 0,
          }}
        />,
      );

      expect(getAllByText('$0.00')).toHaveLength(1);
    });

    it('should handle negative balance amounts', () => {
      const { getByText } = render(
        <Components
          fund={{
            ...defaultFund,
            balance: -500,
          }}
        />,
      );

      expect(getByText('($500.00)')).toBeInTheDocument();
      expect(getByText('($500.00)')).toHaveStyle('color: rgb(211, 47, 47)');
    });

    it('should handle decimal precision correctly', () => {
      const { getByText } = render(
        <Components
          fund={{
            ...defaultFund,
            balance: 1234.567,
          }}
        />,
      );

      expect(getByText('$1,234.57')).toBeInTheDocument();
    });
  });

  it('should call handleOpenTransferModal with correct parameters when Transfer From is clicked', async () => {
    const { findByRole } = render(<Components />);

    const transferFromButton = await findByRole('button', {
      name: /transfer from/i,
    });
    userEvent.click(transferFromButton);

    expect(mockHandleOpenTransferModal).toHaveBeenCalledWith({
      transfer: {
        transferFrom: expect.any(String),
      },
    });
  });

  it('should call handleOpenTransferModal with correct parameters when Transfer To is clicked', async () => {
    const { findByRole } = render(<Components />);

    const transferToButton = await findByRole('button', {
      name: /transfer to/i,
    });
    userEvent.click(transferToButton);

    expect(mockHandleOpenTransferModal).toHaveBeenCalledWith({
      transfer: {
        transferTo: expect.any(String),
      },
    });
  });

  it('should disable transfer from button when current balance is zero', async () => {
    const { findByRole } = render(
      <Components
        fund={{
          ...defaultFund,
          balance: 0,
        }}
      />,
    );

    const transferFromButton = await findByRole('button', {
      name: /transfer from/i,
    });

    expect(transferFromButton).toBeDisabled();
  });
});
