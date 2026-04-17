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
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FinancialAccountsPage from './index.page';

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
  isReady: true,
};
interface ComponentProps {
  userType?: UserTypeEnum;
  userOptionValue?: string;
}

const Components: React.FC<ComponentProps> = ({
  userType = UserTypeEnum.GlobalStaff,
  userOptionValue = 'true',
}) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              FinancialAccounts: FinancialAccountsQuery;
              GetUser: GetUserQuery;
              UserOption: UserOptionQuery;
            }>
              mocks={{
                ...FinancialAccountsMock,
                GetUser: {
                  user: { userType },
                },
                UserOption: {
                  userOption: { value: userOptionValue },
                },
              }}
            >
              <FinancialAccountsPage />
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('Financial Accounts Page', () => {
  it('should show initial financial accounts page', async () => {
    const { findByText } = render(<Components />);

    expect(await findByText('Responsibility Centers')).toBeInTheDocument();

    expect(await findByText('Test Account')).toBeInTheDocument();
  });

  it('should open and close  menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<Components />);

    userEvent.click(
      await findByRole('button', { name: 'Toggle Navigation Panel' }),
    );
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Reports' })).not.toBeInTheDocument();
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <Components userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('should show page if user has not verified user type', async () => {
    const { findByText } = render(
      <Components userType={UserTypeEnum.NonCru} userOptionValue="" />,
    );

    expect(await findByText('Responsibility Centers')).toBeInTheDocument();
    expect(await findByText('Test Account')).toBeInTheDocument();
  });
});
