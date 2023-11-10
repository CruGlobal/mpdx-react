import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from 'src/theme';
import { DialogActionsLeft } from './DialogActions';

describe('DialogActionsLeft', () => {
  it('Should render children', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <DialogActionsLeft>Children</DialogActionsLeft>
      </ThemeProvider>,
    );

    expect(getByText('Children')).toBeInTheDocument();
  });

  it('Should pass down args', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <DialogActionsLeft data-testid="dataTestId">Children</DialogActionsLeft>
      </ThemeProvider>,
    );

    expect(getByTestId('dataTestId')).toBeInTheDocument();
  });
});
