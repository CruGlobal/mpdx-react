import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { NextLinkComposed } from './NextLinkComposed';

describe('NextLinkComposed', () => {
  it('should render a <a> tag', () => {
    const href = 'https://www.mpdx.org';
    const buttonText = 'buttonText';
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <Button component={NextLinkComposed} to={href}>
          {buttonText}
        </Button>
      </ThemeProvider>,
    );

    const button = getByRole('link', { name: buttonText });
    expect(button).toBeVisible();
  });

  it('should pass down other props to Anchor', () => {
    const href = 'https://www.mpdx.org';
    const buttonText = 'buttonText';
    const rightClick = jest.fn();
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <Button
          component={NextLinkComposed}
          to={href}
          onContextMenu={rightClick}
        >
          {buttonText}
        </Button>
      </ThemeProvider>,
    );

    const button = getByRole('link', { name: buttonText });

    userEvent.click(button, { button: 2 });
    expect(rightClick).toHaveBeenCalled();
  });
});
