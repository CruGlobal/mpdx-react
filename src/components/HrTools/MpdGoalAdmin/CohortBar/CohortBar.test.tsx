import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { MpdGoalAdminProvider } from '../MpdGoalAdminContext';
import { CohortBar } from './CohortBar';

const renderBar = () =>
  render(
    <ThemeProvider theme={theme}>
      <MpdGoalAdminProvider>
        <CohortBar />
      </MpdGoalAdminProvider>
    </ThemeProvider>,
  );

describe('CohortBar', () => {
  it('renders the selected cohort name and summary stats', () => {
    const { getByText, getByRole } = renderBar();
    expect(getByRole('combobox', { name: 'Training' })).toHaveTextContent(
      'Fall NSO 2026',
    );
    expect(getByText('13 New Staff')).toBeInTheDocument();
    expect(getByText('08/10/2026')).toBeInTheDocument();
    expect(getByText('View/Edit')).toBeInTheDocument();
  });

  it('opens the Edit Training Costs modal for the selected cohort', async () => {
    const { getByText, getByRole, queryByRole } = renderBar();
    expect(
      queryByRole('heading', { name: 'Training Costs for Fall NSO 2026' }),
    ).not.toBeInTheDocument();

    await userEvent.click(getByText('View/Edit'));

    expect(
      getByRole('heading', { name: 'Training Costs for Fall NSO 2026' }),
    ).toBeInTheDocument();
  });
});
