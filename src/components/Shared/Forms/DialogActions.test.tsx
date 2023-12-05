import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { DialogActionsLeft } from './DialogActions';

describe('DialogActionsLeft', () => {
  it('Should render children and pass down args', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <DialogActionsLeft data-testid="dataTestId">Children</DialogActionsLeft>
      </ThemeProvider>,
    );

    expect(getByText('Children')).toBeInTheDocument();
    expect(getByTestId('dataTestId')).toBeInTheDocument();
  });
});
