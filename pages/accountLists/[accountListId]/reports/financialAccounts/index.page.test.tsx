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
import { FinancialAccountsQuery } from 'src/components/Reports/FinancialAccountsReport/FinancialAccounts/FinancialAccounts.generated';
import { FinancialAccountsMock } from 'src/components/Reports/FinancialAccountsReport/FinancialAccounts/FinancialAccountsMocks';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import { UserTypeEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FinancialAccountsPage from './index.page';

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
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
              FinancialAccounts: FinancialAccountsQuery;
            }>
              mocks={{
                ...FinancialAccountsMock,
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
  it('should show initial financial accounts page', async () => {
    const { findByText } = render(<Components contextValue={defaultContext} />);

    expect(await findByText('Responsibility Centers')).toBeInTheDocument();

    expect(await findByText('Test Account')).toBeInTheDocument();
  });

  it('should open and close  menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <Components contextValue={defaultContext} />,
    );

    userEvent.click(
      await findByRole('button', { name: 'Toggle Navigation Panel' }),
    );
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
