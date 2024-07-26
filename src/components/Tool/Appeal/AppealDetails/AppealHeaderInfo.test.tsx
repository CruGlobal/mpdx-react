import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import theme from 'src/theme';
import { AppealHeaderInfo, AppealHeaderInfoProps } from './AppealHeaderInfo';

const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

const Components = ({ appealInfo, loading }: AppealHeaderInfoProps) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider>
          <AppealsWrapper>
            <AppealHeaderInfo appealInfo={appealInfo} loading={loading} />
          </AppealsWrapper>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  </LocalizationProvider>
);

const initialAppealInfo = {
  id: '1',
  name: 'Test Appeal',
  amount: 100,
  amountCurrency: 'USD',
  pledgesAmountProcessed: 50,
  pledgesAmountReceivedNotProcessed: 25,
  pledgesAmountNotReceivedNotProcessed: 25,
  pledgesAmountTotal: 100,
};

describe('AppealHeaderInfo', () => {
  it('renders skeletons when loading', () => {
    const { getByTestId, getByRole } = render(
      <Components appealInfo={initialAppealInfo} loading={true} />,
    );

    expect(getByRole('heading', { name: 'Name:' })).toBeInTheDocument();
    expect(getByTestId('appeal-name-skeleton')).toBeInTheDocument();

    expect(getByRole('heading', { name: 'Goal:' })).toBeInTheDocument();
    expect(getByTestId('appeal-goal-skeleton')).toBeInTheDocument();
  });

  it('renders appeal info', async () => {
    const { getByText } = render(
      <Components appealInfo={initialAppealInfo} loading={false} />,
    );

    await waitFor(() => {
      expect(getByText('Test Appeal')).toBeInTheDocument();
      expect(getByText('$100')).toBeInTheDocument();
      expect(getByText(/\$50 \(50%\)/i)).toBeInTheDocument();
      expect(getByText(/\$100 \(100%\)/i)).toBeInTheDocument();
    });
  });

  // TODO - Build tests for modals opening and saving data
});
