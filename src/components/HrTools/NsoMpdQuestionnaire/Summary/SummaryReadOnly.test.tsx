import { render } from '__tests__/util/testingLibraryReactMock';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { Summary } from './Summary';

// The default mock leaves the debt answers blank, so an editable Summary would flag missing info
const TestComponent: React.FC = () => (
  <NsoMpdQuestionnaireTestWrapper
    newStaffQuestionnaire={{
      completed: true,
      completedAt: '2026-11-10T12:00:00Z',
    }}
  >
    <Summary />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('Summary of a submitted questionnaire', () => {
  it('shows when it was submitted', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText('Submitted on 11/10/2026')).toBeInTheDocument();
  });

  it('offers no way to edit or submit it', async () => {
    const { findByText, queryByRole, queryByText } = render(<TestComponent />);
    await findByText('Submitted on 11/10/2026');

    expect(queryByRole('button', { name: /^Edit/ })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(
      queryByText('Your form is missing information.'),
    ).not.toBeInTheDocument();
    expect(queryByText(/then select Submit to finish/)).not.toBeInTheDocument();
  });

  it('still lets them go back to read the steps', async () => {
    const { findByText, getByRole } = render(<TestComponent />);
    await findByText('Submitted on 11/10/2026');

    expect(getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });
});
