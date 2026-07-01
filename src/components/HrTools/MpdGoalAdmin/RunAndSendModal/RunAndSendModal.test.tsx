import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { GoalStatusEnum, StaffGoalRow } from '../mpdGoalAdminHelpers';
import { RunAndSendModal } from './RunAndSendModal';

const makeRow = (
  id: string,
  name: string,
  goalStatus: GoalStatusEnum,
): StaffGoalRow => ({
  id,
  name,
  email: `${id}@example.com`,
  ministry: 'Campus',
  geography: 'Geography 01 (1-4)',
  mpdGoal: 1000,
  goalStatus,
  familyStatus: 'Single',
  coach: 'Coach',
  coordinator: 'Coordinator',
});

const rows = [
  makeRow('r1', 'Alice Adams', GoalStatusEnum.Complete),
  makeRow('r2', 'Bob Brown', GoalStatusEnum.Complete),
  makeRow('r3', 'Carlos & Michaela Everts', GoalStatusEnum.Incomplete),
];

const setup = (
  overrides: Partial<React.ComponentProps<typeof RunAndSendModal>> = {},
) => {
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const utils = render(
    <ThemeProvider theme={theme}>
      <RunAndSendModal
        open
        title="Run and Send All Complete MPD Goals?"
        rows={rows}
        onClose={onClose}
        onConfirm={onConfirm}
        {...overrides}
      />
    </ThemeProvider>,
  );
  return { onClose, onConfirm, ...utils };
};

describe('RunAndSendModal', () => {
  it('summarizes the sendable and incomplete goals', () => {
    const { getByText } = setup();
    expect(
      getByText('Run and Send All Complete MPD Goals?'),
    ).toBeInTheDocument();
    expect(
      getByText('1 of the 3 MPD goals cannot be sent.'),
    ).toBeInTheDocument();
    expect(getByText('Carlos & Michaela Everts')).toBeInTheDocument();
    expect(getByText(/Continue with 2 out of 3 MPD goals/)).toBeInTheDocument();
  });

  it('confirms with the sendable count', async () => {
    const { getByRole, onConfirm } = setup();
    await userEvent.click(getByRole('button', { name: 'Yes, Continue' }));
    expect(onConfirm).toHaveBeenCalledWith(2);
  });

  it('cancels via the No, Cancel button', async () => {
    const { getByRole, onClose } = setup();
    await userEvent.click(getByRole('button', { name: 'No, Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('omits the warning when every goal is sendable', () => {
    const { getByText, queryByText } = setup({
      rows: [
        makeRow('r1', 'Alice Adams', GoalStatusEnum.Complete),
        makeRow('r2', 'Bob Brown', GoalStatusEnum.Complete),
      ],
    });
    expect(queryByText(/cannot be sent/)).not.toBeInTheDocument();
    expect(getByText(/Continue with 2 out of 2 MPD goals/)).toBeInTheDocument();
  });

  it('disables Continue when nothing can be sent', () => {
    const { getByRole } = setup({
      rows: [
        makeRow('r3', 'Carlos & Michaela Everts', GoalStatusEnum.Incomplete),
      ],
    });
    expect(getByRole('button', { name: 'Yes, Continue' })).toBeDisabled();
  });
});
