import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import theme from 'src/theme';
import { appealInfo } from '../../appealMockData';
import { AppealHeaderInfo, AppealHeaderInfoProps } from './AppealHeaderInfo';

const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

const Components = ({ appealInfo, loading }: AppealHeaderInfoProps) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <AppealsWrapper>
              <AppealHeaderInfo appealInfo={appealInfo} loading={loading} />
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>
    </ThemeProvider>
  </LocalizationProvider>
);

describe('AppealHeaderInfo', () => {
  it('renders skeletons when loading', () => {
    const { getByTestId, getByRole } = render(
      <Components appealInfo={appealInfo} loading={true} />,
    );

    expect(getByRole('heading', { name: 'Name:' })).toBeInTheDocument();
    expect(getByTestId('appeal-name-skeleton')).toBeInTheDocument();

    expect(getByRole('heading', { name: 'Goal:' })).toBeInTheDocument();
    expect(getByTestId('appeal-goal-skeleton')).toBeInTheDocument();
  });

  it('renders appeal info', async () => {
    const { getByText, findByText } = render(
      <Components appealInfo={appealInfo} loading={false} />,
    );

    expect(await findByText('Test Appeal')).toBeInTheDocument();

    expect(getByText('$100')).toBeInTheDocument();
    expect(getByText(/\$50 \(50%\)/i)).toBeInTheDocument();
    expect(getByText(/\$100 \(100%\)/i)).toBeInTheDocument();
  });

  it('should allow user to open the edit appeal info modal', async () => {
    const { findByText, findByRole, getByTestId, getByRole, queryByRole } =
      render(<Components appealInfo={appealInfo} loading={false} />);

    expect(await findByText('Test Appeal')).toBeInTheDocument();

    userEvent.click(getByTestId('edit-appeal-name'));

    expect(
      await findByRole('heading', { name: 'Edit Appeal' }),
    ).toBeInTheDocument();

    userEvent.click(getByTestId('edit-appeal-goal'));

    expect(
      await findByRole('heading', { name: 'Edit Appeal' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(
        queryByRole('heading', { name: 'Edit Appeal' }),
      ).not.toBeInTheDocument();
    });
  });
});
