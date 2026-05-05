import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { Facebook } from './Facebook';

describe('Facebook Button', () => {
  it('Should not render if there is no username', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Facebook username={''} />
      </ThemeProvider>,
    );

    expect(queryByTestId('FacebookIcon')).not.toBeInTheDocument();
  });
  it('Should render if there is a username', () => {
    const { getByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <Facebook username={'test'} />
      </ThemeProvider>,
    );

    expect(getByTestId('FacebookIcon')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href',
      'https://www.facebook.com/test',
    );
  });
});
