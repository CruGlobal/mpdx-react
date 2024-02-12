import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { LinkedIn } from './LinkedIn';

describe('LinkedIn Button', () => {
  it('Should not render if there is no publicUrl', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <LinkedIn publicUrl={''} />
      </ThemeProvider>,
    );

    expect(queryByTestId('LinkedInIcon')).not.toBeInTheDocument();
  });
  it('Should render if there is a publicUrl', () => {
    const { getByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <LinkedIn publicUrl={'https://www.linkedin.com/test'} />
      </ThemeProvider>,
    );

    expect(getByTestId('LinkedInIcon')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href',
      'https://www.linkedin.com/test',
    );
  });
});
