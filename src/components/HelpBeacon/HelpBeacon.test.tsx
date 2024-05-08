import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { HelpBeacon } from './HelpBeacon';

describe('HelpBeacon', () => {
  it('renders', () => {
    const url = 'https://google.com';
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <HelpBeacon helpUrl={url} />
      </ThemeProvider>,
    );
    expect(getByRole('link')).toHaveAttribute('href', url);
  });
});
