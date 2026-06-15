import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { Settings } from './Settings';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <Settings />
  </ThemeProvider>
);

describe('Settings', () => {
  it('renders the informational title and description', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText('Please read all information before answering.'),
    ).toBeInTheDocument();
    expect(
      getByText(/One of the most common causes of errors in MPD goals/),
    ).toBeInTheDocument();
  });

  it('renders as an info alert (guidance, not a warning)', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('alert')).toHaveClass('MuiAlert-standardInfo');
  });
});
