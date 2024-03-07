import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { Website } from './Website';

describe('Website Button', () => {
  it('Should not render if there is no url', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Website url={''} />
      </ThemeProvider>,
    );

    expect(queryByTestId('LanguageIcon')).not.toBeInTheDocument();
  });
  it('Should render if there is a url', () => {
    const { getByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <Website url={'https://www.cru.org'} />
      </ThemeProvider>,
    );

    expect(getByTestId('LanguageIcon')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', 'https://www.cru.org');
  });
});
