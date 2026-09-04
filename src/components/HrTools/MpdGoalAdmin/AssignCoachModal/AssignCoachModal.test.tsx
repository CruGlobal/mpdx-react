import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { AssignCoachOption } from '../mpdGoalAdminHelpers';
import { AssignCoachModal } from './AssignCoachModal';

const coaches: AssignCoachOption[] = [
  { id: 'coach-1', name: 'Jane Coach' },
  { id: 'coach-2', name: 'John Mentor' },
];

const handleClose = jest.fn();
const handleAssignCoach = jest.fn();

interface TestComponentProps {
  coaches?: AssignCoachOption[];
  loading?: boolean;
  reassignedNames?: string[];
}

const TestComponent: React.FC<TestComponentProps> = ({
  coaches: coachesProp = coaches,
  loading,
  reassignedNames,
}) => (
  <ThemeProvider theme={theme}>
    <AssignCoachModal
      subjectName="Carlos & Michaela Everts"
      coaches={coachesProp}
      loading={loading}
      reassignedNames={reassignedNames}
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

  it('explains itself when there are no coaches to select', () => {
    const { getByRole, queryByRole } = render(<TestComponent coaches={[]} />);

    expect(getByRole('alert')).toHaveTextContent(
      'No coaches are available to assign for this cohort. Coach eligibility comes from OneApp.',
    );
    expect(queryByRole('combobox', { name: 'Coach' })).not.toBeInTheDocument();
  });

  it('does not call the list empty while it is still loading', () => {
    const { getByRole, queryByRole } = render(
      <TestComponent coaches={[]} loading />,
    );

    expect(getByRole('combobox', { name: 'Coach' })).toBeDisabled();
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('warns about staff whose existing coach will be replaced', () => {
    const { getByRole } = render(
      <TestComponent reassignedNames={['John & Jane Doe', "James O'Connor"]} />,
    );

    const alert = getByRole('alert');
    expect(alert).toHaveTextContent(
      '2 of the selected staff already have a coach.',
    );
    expect(alert).toHaveTextContent(
      'Assigning a new coach will replace the current coach for the following staff.',
    );
    expect(alert).toHaveTextContent('John & Jane Doe');
    expect(alert).toHaveTextContent("James O'Connor");
  });

  it('does not warn when no selected staff already have a coach', () => {
    const { queryByRole } = render(<TestComponent reassignedNames={[]} />);

    expect(queryByRole('alert')).not.toBeInTheDocument();
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

  it('stays open and reports a failed assignment', async () => {
    handleAssignCoach.mockRejectedValueOnce(new Error('Not authorized'));
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('combobox', { name: 'Coach' }));
    userEvent.click(await findByRole('option', { name: 'Jane Coach' }));
    await waitFor(() =>
      expect(getByRole('button', { name: 'Save' })).toBeEnabled(),
    );
    userEvent.click(getByRole('button', { name: 'Save' }));

    expect(await findByRole('alert')).toHaveTextContent(
      'The coach could not be assigned. Please try again.',
    );
    expect(handleClose).not.toHaveBeenCalled();
  });
});
