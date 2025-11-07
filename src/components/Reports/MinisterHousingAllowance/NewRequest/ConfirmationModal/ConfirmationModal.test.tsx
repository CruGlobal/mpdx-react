import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PageEnum } from '../../Shared/sharedTypes';
import { ConfirmationModal } from './ConfirmationModal';

const handleClose = jest.fn();
const handleConfirm = jest.fn();

interface TestComponentProps {
  type: PageEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({ type }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <ConfirmationModal
        type={type}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </TestRouter>
  </ThemeProvider>
);

describe('ConfirmationModal', () => {
  it('renders submit confirmation modal correctly', async () => {
    const { getByText, getByRole } = render(
      <TestComponent type={PageEnum.New} />,
    );

    expect(
      getByText('Are you ready to submit your MHA request?'),
    ).toBeInTheDocument();
    expect(
      getByText('You are submitting your MHA Request for board approval.'),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /YES, CONTINUE/i }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('renders update confirmation modal correctly', async () => {
    const { getByText, getByRole } = render(
      <TestComponent type={PageEnum.Edit} />,
    );

    expect(
      getByText('Are you ready to update your MHA request?'),
    ).toBeInTheDocument();
    expect(
      getByText(/you are submitting changes to your annual/i),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /YES, CONTINUE/i }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls handleClose when modal is closed', async () => {
    const { getByRole } = render(<TestComponent type={PageEnum.New} />);

    await userEvent.click(getByRole('button', { name: /GO BACK/i }));
    expect(handleClose).toHaveBeenCalled();
  });
});
