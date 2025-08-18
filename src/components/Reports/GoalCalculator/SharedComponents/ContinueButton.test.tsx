import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { ContinueButton } from './ContinueButton';

const TestComponent: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <ThemeProvider theme={theme}>
    <ContinueButton onClick={onClick} />
  </ThemeProvider>
);

describe('ContinueButton', () => {
  it('should render continue button', () => {
    const mockOnClick = jest.fn();
    const { getByRole } = render(<TestComponent onClick={mockOnClick} />);

    const continueButton = getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = jest.fn();
    const { getByRole } = render(<TestComponent onClick={mockOnClick} />);

    const continueButton = getByRole('button', { name: 'Continue' });
    userEvent.click(continueButton);

    expect(mockOnClick).toHaveBeenCalled();
  });
});
