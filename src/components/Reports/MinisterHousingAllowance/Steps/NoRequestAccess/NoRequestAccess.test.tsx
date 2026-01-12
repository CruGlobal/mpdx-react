import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { NoRequestAccess } from './NoRequestAccess';

const Components = () => (
  <ThemeProvider theme={theme}>
    <NoRequestAccess />
  </ThemeProvider>
);

describe('NoRequestAccess', () => {
  it('should render the NoRequestAccess component and support link', () => {
    const { getByText, getByRole } = render(<Components />);

    expect(
      getByRole('heading', {
        name: 'You do not have permission to request a ministry housing allowance.',
      }),
    ).toBeInTheDocument();
    expect(
      getByText(/our records show that you are not eligible to apply for/i),
    ).toBeInTheDocument();
    expect(getByRole('link', { name: 'support@mpdx.org' })).toBeInTheDocument();
  });
});
