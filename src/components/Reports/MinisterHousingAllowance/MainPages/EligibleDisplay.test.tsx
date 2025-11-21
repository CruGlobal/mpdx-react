import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { EligibleDisplay } from './EligibleDisplay';

const title = 'Test Title';

interface TestComponentProps {
  isPending: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ isPending }) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <EligibleDisplay isPending={isPending} />
    </LocalizationProvider>
  </ThemeProvider>
);

describe('EligibleDisplay', () => {
  it('should render title and message when pending is true', () => {
    const { getByText } = render(<TestComponent isPending={true} />);

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(/waiting to be processed/i)).toBeInTheDocument();
  });

  it('should render title and message when pending is false', () => {
    const { getByText } = render(<TestComponent isPending={false} />);

    expect(getByText(title)).toBeInTheDocument();
    expect(
      getByText(/our records indicate that you have an approved mha amount/i),
    ).toBeInTheDocument();
  });
});
