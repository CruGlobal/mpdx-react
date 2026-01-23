import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { NoEditAccess } from './NoEditAccess';

const Components = () => (
  <ThemeProvider theme={theme}>
    <NoEditAccess />
  </ThemeProvider>
);

describe('NoEditAccess', () => {
  it('should render the NoEditAccess component and support link', () => {
    const { getByText, getByRole } = render(<Components />);

    expect(
      getByRole('heading', {
        name: 'You do not have permission to edit this request.',
      }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /our records show that this request is either approved or under review/i,
      ),
    ).toBeInTheDocument();
    expect(getByRole('link', { name: 'support@mpdx.org' })).toBeInTheDocument();
  });
});
