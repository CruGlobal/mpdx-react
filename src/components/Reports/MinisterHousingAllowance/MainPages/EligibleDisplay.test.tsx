import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { EligibleDisplay, EligibleDisplayProps } from './EligibleDisplay';

const TestComponent: React.FC<EligibleDisplayProps> = (props) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <EligibleDisplay {...props} />
    </LocalizationProvider>
  </ThemeProvider>
);

describe('EligibleDisplay', () => {
  it('should render message when isPending is true', () => {
    const { getByText } = render(<TestComponent isPending isEditable />);

    expect(getByText(/waiting to be processed/i)).toBeInTheDocument();
    expect(
      getByText(/click on the "edit request" button below/i),
    ).toBeInTheDocument();
  });

  it('should hide editing message when isEditable is false', () => {
    const { queryByText } = render(
      <TestComponent isPending isEditable={false} />,
    );

    expect(
      queryByText(/click on the "edit request" button below/i),
    ).not.toBeInTheDocument();
  });

  it('should render message when isPending is false', () => {
    const { getByText } = render(
      <TestComponent isPending={false} isEditable={false} />,
    );

    expect(
      getByText(/our records indicate that you have an approved mha amount/i),
    ).toBeInTheDocument();
  });
});
