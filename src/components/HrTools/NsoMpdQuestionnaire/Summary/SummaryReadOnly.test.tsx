import userEvent from '@testing-library/user-event';
import { render } from '__tests__/util/testingLibraryReactMock';
import { NsoMpdQuestionnaire } from '../NsoMpdQuestionnaire';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { Summary } from './Summary';

// The default mock leaves the debt answers blank, so an editable Summary would flag missing info
const TestComponent: React.FC<{
  completed?: boolean;
  completedAt?: string | null;
  children?: React.ReactNode;
}> = ({
  completed = true,
  completedAt = '2026-11-10T12:00:00Z',
  children = <Summary />,
}) => (
  <NsoMpdQuestionnaireTestWrapper
    newStaffQuestionnaire={{ completed, completedAt }}
  >
    {children}
  </NsoMpdQuestionnaireTestWrapper>
);

describe('Summary of a submitted questionnaire', () => {
  it('shows when it was submitted', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText('Submitted on 11/10/2026')).toBeInTheDocument();
  });

  it('says it was submitted when the date is missing', async () => {
    const { findByText, queryByText } = render(
      <TestComponent completedAt={null} />,
    );

    expect(
      await findByText('This questionnaire has been submitted.'),
    ).toBeInTheDocument();
    expect(queryByText(/then select Submit to finish/)).not.toBeInTheDocument();
  });

  it('says it was submitted when the date cannot be read', async () => {
    const { findByText } = render(<TestComponent completedAt="not a date" />);

    expect(
      await findByText('This questionnaire has been submitted.'),
    ).toBeInTheDocument();
  });

  it('asks for review while not submitted, even with a submission date', async () => {
    const { findByText, getByText, queryByText } = render(
      <TestComponent completed={false} />,
    );
    await findByText('John Doe');

    expect(getByText(/then select Submit to finish/)).toBeInTheDocument();
    expect(queryByText('Submitted on 11/10/2026')).not.toBeInTheDocument();
  });

  it('offers no way to edit or submit it', async () => {
    const { findByText, getByRole, getByText, queryByRole, queryByText } =
      render(<TestComponent />);
    await findByText('Submitted on 11/10/2026');

    expect(
      getByRole('heading', { level: 6, name: 'Personal Information' }),
    ).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(queryByRole('button', { name: /^Edit/ })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(
      queryByText('Your form is missing information.'),
    ).not.toBeInTheDocument();
    expect(queryByText(/then select Submit to finish/)).not.toBeInTheDocument();
  });

  it('still lets them go back to read the steps', async () => {
    const { findByRole, findByText, getByRole } = render(
      <TestComponent>
        <NsoMpdQuestionnaire />
      </TestComponent>,
    );
    await findByText('Submitted on 11/10/2026');

    userEvent.click(getByRole('button', { name: 'Back' }));

    expect(
      await findByRole('radio', { name: 'Single in hotel/dorm room' }),
    ).toBeDisabled();
  });
});
