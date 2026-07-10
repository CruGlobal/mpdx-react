import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { AssignCoachModal, AssignCoachOption } from './AssignCoachModal';

const coaches: AssignCoachOption[] = [
  { id: 'coach-1', name: 'Jane Coach' },
  { id: 'coach-2', name: 'John Mentor' },
];

const handleClose = jest.fn();
const handleAssignCoach = jest.fn();

interface TestComponentProps {
  coaches?: AssignCoachOption[];
}

const TestComponent: React.FC<TestComponentProps> = ({
  coaches: coachesProp = coaches,
}) => (
  <ThemeProvider theme={theme}>
    <AssignCoachModal
      subjectName="Carlos & Michaela Everts"
      coaches={coachesProp}
      handleClose={handleClose}
      handleAssignCoach={handleAssignCoach}
    />
  </ThemeProvider>
);

describe('AssignCoachModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the subject name in the title', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText('Assign Coach for Carlos & Michaela Everts'),
    ).toBeInTheDocument();
  });

  it('disables Save until a coach is selected', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('keeps Save disabled when there are no coaches to select', () => {
    const { getByRole } = render(<TestComponent coaches={[]} />);

    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('closes when Cancel is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(handleClose).toHaveBeenCalled();
    expect(handleAssignCoach).not.toHaveBeenCalled();
  });

  it('closes when the close icon is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Close' }));

    expect(handleClose).toHaveBeenCalled();
  });

  it('enables Save and assigns the selected coach on submit', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const combobox = getByRole('combobox', { name: 'Coach' });
    userEvent.click(combobox);
    userEvent.click(await findByRole('option', { name: 'Jane Coach' }));

    const saveButton = getByRole('button', { name: 'Save' });
    await waitFor(() => expect(saveButton).toBeEnabled());

    userEvent.click(saveButton);

    await waitFor(() =>
      expect(handleAssignCoach).toHaveBeenCalledWith('coach-1'),
    );
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });
});
