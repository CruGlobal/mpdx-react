import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { FinancialAccountQuery } from 'src/components/Reports/FinancialAccountsReport/Context/FinancialAccount.generated';
import { defaultFinancialAccount } from 'src/components/Reports/FinancialAccountsReport/Header/HeaderMocks';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import { UserTypeEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FinancialAccountsPage from './entries.page';

const accountListId = 'account-list-1';
const financialAccountId = 'financialAccountId';
const router = {
  query: {
    accountListId,
    financialAccount: [financialAccountId, 'entries'],
  },
  isReady: true,
};

const defaultContext: UserPreferenceType = {
  locale: 'en-US',
  userType: UserTypeEnum.UsStaff,
};

interface ComponentProps {
  contextValue: UserPreferenceType;
}

const Components: React.FC<ComponentProps> = ({ contextValue }) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              FinancialAccount: FinancialAccountQuery;
            }>
              mocks={{
                FinancialAccount: defaultFinancialAccount,
              }}
            >
              <UserPreferenceContext.Provider value={contextValue}>
                <FinancialAccountsPage />
              </UserPreferenceContext.Provider>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('Financial Accounts Page', () => {
  it('should show the transactions page for a financial account', async () => {
    const { findByText, findByRole, getByText, queryByText, queryByRole } =
      render(<Components contextValue={defaultContext} />);

    expect(await findByText('Account 1')).toBeInTheDocument();

    expect(
      await findByRole('button', { name: 'Export CSV' }),
    ).toBeInTheDocument();

    expect(getByText('Totals for Period')).toBeInTheDocument();

    expect(queryByText('Responsibility Centers')).not.toBeInTheDocument();
    expect(
      queryByRole('heading', { name: 'Category' }),
    ).not.toBeInTheDocument();
  });

  it('should open filters on load', async () => {
    const { findByRole } = render(<Components contextValue={defaultContext} />);

    expect(await findByRole('heading', { name: 'Filter' })).toBeInTheDocument();
  });

  it('should open and close filters and menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <Components contextValue={defaultContext} />,
    );

    // Filters
    expect(await findByRole('heading', { name: 'Filter' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Filter' })).not.toBeInTheDocument();

    // Menu
    userEvent.click(getByRole('img', { name: 'Toggle Menu Panel' }));
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Reports' })).not.toBeInTheDocument();
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <Components
        contextValue={{ ...defaultContext, userType: UserTypeEnum.NonCru }}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
