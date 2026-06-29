import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { MpdGoalAdmin } from './MpdGoalAdmin';
import { MpdGoalAdminProvider } from './MpdGoalAdminContext';

const renderMain = () =>
  render(
    <ThemeProvider theme={theme}>
      <MpdGoalAdminProvider>
        <MpdGoalAdmin onNavListToggle={jest.fn()} navListOpen={false} />
      </MpdGoalAdminProvider>
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
    const { getByRole, queryByText } = renderMain();
    await userEvent.type(getByRole('textbox', { name: 'Search' }), 'Liam');
    expect(queryByText('Liam Patterson')).toBeInTheDocument();
    expect(queryByText('John & Jane Doe')).not.toBeInTheDocument();
  });

  it('switches to the scenario goals placeholder', async () => {
    const { getByRole, queryByRole, getByText } = renderMain();
    await userEvent.click(getByRole('tab', { name: 'Scenario Goals' }));
    expect(queryByRole('table')).not.toBeInTheDocument();
    expect(getByText('Scenario goals coming soon.')).toBeInTheDocument();
  });
});
