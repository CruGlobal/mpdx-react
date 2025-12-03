import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { CancelModal } from './CancelModal';

const mutationSpy = jest.fn();

interface TestComponentProps {
  handleClose?: () => void;
  handleConfirm?: () => void;
}

const TestComponent: React.FC<TestComponentProps> = ({
  handleClose = () => {},
  handleConfirm = () => {},
}) => (
  <ThemeProvider theme={theme}>
    <CancelModal handleClose={handleClose} handleConfirm={handleConfirm} />
  </ThemeProvider>
);

describe('CancelModal', () => {
  it('should render the cancel modal with correct content', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('dialog')).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Do you want to cancel?' }),
    ).toBeInTheDocument();
  });

  it('should call handleClose when cancel button is clicked', async () => {
    const { getByRole } = render(<TestComponent handleClose={mutationSpy} />);

    const cancelButton = getByRole('button', { name: 'NO' });
    userEvent.click(cancelButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalled();
    });
  });

  it('should call handleConfirm when confirm button is clicked', async () => {
    const { getByRole } = render(
      <TestComponent handleConfirm={mutationSpy} />,
    );

    const confirmButton = getByRole('button', { name: 'Yes, Cancel' });
    userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalled();
    });
  });
});
