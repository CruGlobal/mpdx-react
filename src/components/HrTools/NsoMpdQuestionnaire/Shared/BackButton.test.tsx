import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { BackButton } from './BackButton';

const renderButton = (onClick = jest.fn()) =>
  render(
    <ThemeProvider theme={theme}>
      <BackButton onClick={onClick} />
    </ThemeProvider>,
  );

describe('BackButton', () => {
  it('renders a Back label', () => {
    const { getByRole } = renderButton();

    expect(getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    const { getByRole } = renderButton(onClick);

    userEvent.click(getByRole('button', { name: 'Back' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is always enabled', () => {
    const { getByRole } = renderButton();

    expect(getByRole('button', { name: 'Back' })).toBeEnabled();
  });
});
