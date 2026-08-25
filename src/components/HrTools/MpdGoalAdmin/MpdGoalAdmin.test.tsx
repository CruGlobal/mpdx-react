import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdmin } from './MpdGoalAdmin';
import { MpdGoalAdminProvider } from './MpdGoalAdminContext';

const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
  push: jest.fn(),
};

const renderMain = () =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <MpdGoalAdminProvider>
              <MpdGoalAdmin onNavListToggle={jest.fn()} navListOpen={false} />
            </MpdGoalAdminProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>
    </ThemeProvider>,
  );

describe('MpdGoalAdmin', () => {
  it('renders the title and the active goals table', () => {
    const { getByText, getByRole } = renderMain();
    expect(getByText('MPD Goal Calculator - Admin Table')).toBeInTheDocument();
    expect(getByRole('table')).toBeInTheDocument();
    expect(getByText('John & Jane Doe')).toBeInTheDocument();
  });

  it('filters rows by the search term', async () => {
    const { getByRole, getByText, queryByText } = renderMain();
    await userEvent.type(getByRole('textbox', { name: 'Search' }), 'Liam');
    expect(getByText('Liam Patterson')).toBeInTheDocument();
    expect(queryByText('John & Jane Doe')).not.toBeInTheDocument();
  });

  it('switches to the scenario goals tab', async () => {
    const { getByRole, findByRole } = renderMain();
    await userEvent.click(getByRole('tab', { name: 'Scenario Goals' }));
    expect(
      await findByRole('button', { name: 'New Scenario Goal' }),
    ).toBeInTheDocument();
  });
});
