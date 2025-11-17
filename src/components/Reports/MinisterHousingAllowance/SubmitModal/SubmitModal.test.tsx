import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../Shared/sharedTypes';
import { SubmitModal } from './SubmitModal';

const handleClose = jest.fn();
const handleConfirm = jest.fn();

interface TestComponentProps {
  pageType?: PageEnum;
  isCancel?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pageType,
  isCancel,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <MinisterHousingAllowanceProvider type={pageType}>
        <SubmitModal
          handleClose={handleClose}
          handleConfirm={handleConfirm}
          isCancel={isCancel}
        />
      </MinisterHousingAllowanceProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ConfirmationModal', () => {
  it('renders submit confirmation modal correctly', async () => {
    const { getByText, getByRole } = render(
      <TestComponent pageType={PageEnum.New} />,
    );

    expect(
      getByText('Are you ready to submit your MHA Request?'),
    ).toBeInTheDocument();
    expect(
      getByText('You are submitting your MHA Request for board approval.'),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /YES, CONTINUE/i }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('renders update confirmation modal correctly', async () => {
    const { getByText, getByRole } = render(
      <TestComponent pageType={PageEnum.Edit} />,
    );

    expect(
      getByRole('heading', {
        name: 'Are you ready to submit your updated MHA Request?',
      }),
    ).toBeInTheDocument();

    expect(
      getByText(/you are submitting changes to your annual/i),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /YES, CONTINUE/i }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls handleClose when modal is closed', async () => {
    const { getByRole } = render(<TestComponent isCancel={true} />);

    expect(
      getByRole('heading', { name: 'Do you want to cancel?' }),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /NO/i }));
    expect(handleClose).toHaveBeenCalled();
  });
});
