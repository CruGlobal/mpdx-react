import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { ConfirmationModal } from './ConfirmationModal';

const mutationSpy = jest.fn();

interface TestComponentProps {
  handleClose?: () => void;
  handleConfirm?: () => void;
  deadlineDate?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  handleClose = () => {},
  handleConfirm = () => {},
  deadlineDate = '2025-12-31',
}) => (
  <ThemeProvider theme={theme}>
    <ConfirmationModal
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      deadlineDate={deadlineDate}
    />
  </ThemeProvider>
);

describe('ConfirmationModal', () => {
  it('should render the confirmation modal with correct content', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('dialog')).toBeInTheDocument();
    expect(
      getByRole('heading', {
        name: 'Are you ready to submit your Salary Calculation Form?',
      }),
    ).toBeInTheDocument();
  });

  it('should call handleClose when go back button is clicked', async () => {
    const { getByRole } = render(<TestComponent handleClose={mutationSpy} />);

    const goBackButton = getByRole('button', { name: 'GO BACK' });
    userEvent.click(goBackButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalled();
    });
  });

  it('should call handleConfirm when continue button is clicked', async () => {
    const { getByRole } = render(
      <TestComponent handleConfirm={mutationSpy} />,
    );

    const continueButton = getByRole('button', { name: 'Yes, Continue' });
    userEvent.click(continueButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalled();
    });
  });
});
