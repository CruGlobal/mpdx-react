import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/styles';
import userEvent from '@testing-library/user-event';
import { ModalDeleteButton } from './ModalDeleteButton';
import theme from 'src/theme';

const onClick = jest.fn();

describe('ModalDeleteButton', () => {
  it('should render the button', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ModalDeleteButton onClick={onClick} />
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('Delete')).toBeInTheDocument());
  });

  it('should call the onClick function', async () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <ModalDeleteButton onClick={onClick} />
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('Delete')).toBeInTheDocument());
    userEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
