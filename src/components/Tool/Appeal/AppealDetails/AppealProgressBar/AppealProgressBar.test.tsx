import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import theme from 'src/theme';
import AppealProgressBar, { AppealProgressBarProps } from './AppealProgressBar';

const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

const Components = ({
  given,
  received,
  committed,
  amount,
  amountCurrency,
}: AppealProgressBarProps) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider>
          <AppealsWrapper>
            <AppealProgressBar
              given={given}
              received={received}
              committed={committed}
              amount={amount}
              amountCurrency={amountCurrency}
            />
          </AppealsWrapper>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  </LocalizationProvider>
);

describe('AppealProgressBar', () => {
  describe('Errors', () => {
    it('handle string instead of number', async () => {
      const { getAllByText } = render(
        <Components
          given={'100' as any}
          received={0}
          committed={0}
          amount={'1000' as any}
          amountCurrency="USD"
        />,
      );

      await waitFor(() => {
        expect(getAllByText(/\$0 \(10%\)/i).length).toBe(3);
      });
    });

    it('handle default with no data', async () => {
      const { getAllByText } = render(
        <Components
          given={0}
          received={0}
          committed={0}
          amount={1000}
          amountCurrency="USD"
        />,
      );

      await waitFor(() => {
        expect(getAllByText(/\$0 \(0%\)/i).length).toBe(3);
      });
    });
  });

  describe('Renders correct amounts and currency', () => {
    it('renders progress bar in USD', async () => {
      const { getByText } = render(
        <Components
          given={100}
          received={200}
          committed={300}
          amount={1000}
          amountCurrency="USD"
        />,
      );

      await waitFor(() => {
        expect(getByText(/\$100 \(10%\)/i)).toBeInTheDocument();
        expect(getByText(/\$300 \(30%\)/i)).toBeInTheDocument();
        expect(getByText(/\$600 \(60%\)/i)).toBeInTheDocument();
      });
    });

    it('renders progress bar in Euros', async () => {
      const { getByText } = render(
        <Components
          given={100}
          received={200}
          committed={300}
          amount={1000}
          amountCurrency="EUR"
        />,
      );

      await waitFor(() => {
        expect(getByText(/\€100 \(10%\)/i)).toBeInTheDocument();
        expect(getByText(/\€300 \(30%\)/i)).toBeInTheDocument();
        expect(getByText(/\€600 \(60%\)/i)).toBeInTheDocument();
      });
    });

    it('renders progress bar in NZ dollars', async () => {
      const { getByText } = render(
        <Components
          given={100}
          received={200}
          committed={300}
          amount={1000}
          amountCurrency="NZD"
        />,
      );

      await waitFor(() => {
        expect(getByText(/nz\$100 \(10%\)/i)).toBeInTheDocument();
        expect(getByText(/nz\$300 \(30%\)/i)).toBeInTheDocument();
        expect(getByText(/nz\$600 \(60%\)/i)).toBeInTheDocument();
      });
    });
  });
});
