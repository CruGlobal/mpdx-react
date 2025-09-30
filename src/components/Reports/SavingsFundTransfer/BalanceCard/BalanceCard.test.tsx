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
import { FundFieldsFragment } from '../ReportsSavingsFund.generated';
import { FundTypeEnum } from '../mockData';
import { BalanceCard } from './BalanceCard';

const accountListId = 'abc';
const router = {
  query: { accountListId },
  isReady: true,
};

const mutationSpy = jest.fn();
const mockHandleOpenTransferModal = jest.fn();

const defaultFund = {
  id: crypto.randomUUID(),
  fundType: 'Primary',
  balance: 15000,
  deficitLimit: 0,
};

interface ComponentsProps {
  fund?: FundFieldsFragment;
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
            <BalanceCard
              fund={fund}
              handleOpenTransferModal={mockHandleOpenTransferModal}
              isSelected={isSelected}
            />
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

    expect(getByText('Primary Account Balance')).toBeInTheDocument();
    expect(getByText('$15,000.00')).toBeInTheDocument();
    expect(getByRole('button', { name: /transfer from/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /transfer to/i })).toBeInTheDocument();
  });

  it('should display title correctly', () => {
    const fundType = 'Custom Title';
    const { getByText } = render(
      <Components
        fund={{
          ...defaultFund,
          fundType,
        }}
      />,
    );

    expect(getByText(`${fundType} Account Balance`)).toBeInTheDocument();
  });

  describe('Icons', () => {
    it('should display savings icon', () => {
      const { getByTestId } = render(
        <Components
          fund={{
            ...defaultFund,
            fundType: FundTypeEnum.Savings,
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
            fundType: 'Conference Savings',
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
            fundType: FundTypeEnum.Primary,
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
      const { getByText } = render(
        <Components
          fund={{
            ...defaultFund,
            balance: 0,
          }}
        />,
      );

      expect(getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle negative balance amount', () => {
      const { getByText } = render(
        <Components
          fund={{
            ...defaultFund,
            balance: -500,
          }}
        />,
      );

      expect(getByText('-$500.00')).toBeInTheDocument();
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
});
