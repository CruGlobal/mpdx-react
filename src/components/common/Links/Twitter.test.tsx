import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { Twitter } from './Twitter';

describe('Twitter Button', () => {
  it('Should not render if there is no screenName', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Twitter screenName={''} />
      </ThemeProvider>,
    );

    expect(queryByTestId('TwitterIcon')).not.toBeInTheDocument();
  });
  it('Should render if there is a screenName', () => {
    const { getByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <Twitter screenName={'test'} />
      </ThemeProvider>,
    );

    expect(getByTestId('TwitterIcon')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href',
      'https://www.twitter.com/test',
    );
  });
});
