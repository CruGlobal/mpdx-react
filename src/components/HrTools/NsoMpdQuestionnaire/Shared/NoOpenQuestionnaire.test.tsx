import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { NoOpenQuestionnaire } from './NoOpenQuestionnaire';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <NoOpenQuestionnaire />
  </ThemeProvider>
);

describe('NoOpenQuestionnaire', () => {
  it('renders the informational message', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('No open questionnaire')).toBeInTheDocument();
    expect(
      getByText(
        "You don't have a questionnaire to complete right now. If you think this is a mistake, contact your ministry HR/onboarding team.",
      ),
    ).toBeInTheDocument();
  });
});
