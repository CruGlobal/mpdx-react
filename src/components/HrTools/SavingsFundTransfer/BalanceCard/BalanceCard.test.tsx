import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
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
  endBalance: 15000,
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
        <GqlMockedProvider onCall={mutationSpy}>
          <BalanceCard
            fund={fund}
            handleOpenTransferModal={mockHandleOpenTransferModal}
            isSelected={isSelected}
          />
        </GqlMockedProvider>
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
    expect(getByText('Current Balance')).toBeInTheDocument();
    expect(getByText('$15,000.00')).toBeInTheDocument();
    expect(getByRole('button', { name: /transfer from/i })).toBeInTheDocument();
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

      expect(getByTestId('Diversity1Icon')).toBeInTheDocument();
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
            endBalance: 1234567.89,
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
            endBalance: 0,
          }}
        />,
      );

      expect(getAllByText('$0.00')).toHaveLength(1);
    });

    it('should handle negative balance amount', () => {
      const { getByText } = render(
        <Components
          fund={{
            ...defaultFund,
            endBalance: -500,
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
            endBalance: 1234.567,
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

  it('should disable transfer from button when current balance goes beyond deficit limit', async () => {
    const { findByRole } = render(
      <Components
        fund={{
          ...defaultFund,
          endBalance: -100,
        }}
      />,
    );

    const transferFromButton = await findByRole('button', {
      name: /transfer from/i,
    });

    expect(transferFromButton).toBeDisabled();
  });
});
