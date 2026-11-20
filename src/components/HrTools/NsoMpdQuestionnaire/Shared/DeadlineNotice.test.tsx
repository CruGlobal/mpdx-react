import { render } from '__tests__/util/testingLibraryReactMock';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { DeadlineNotice } from './DeadlineNotice';
import { useNsoMpdQuestionnaire } from './NsoMpdQuestionnaireContext';

/** Shows once the questionnaire query has answered. */
const LoadedProbe: React.FC = () => {
  const { questionnaire } = useNsoMpdQuestionnaire();
  return questionnaire ? <span>loaded</span> : null;
};

const deadline = '2027-01-20T22:00:00Z';

const renderNotice = (
  questionnaire: Partial<{
    completed: boolean;
    locked: boolean;
    deadline: string | null;
  }>,
) =>
  render(
    <NsoMpdQuestionnaireTestWrapper newStaffQuestionnaire={questionnaire}>
      <DeadlineNotice />
      <LoadedProbe />
    </NsoMpdQuestionnaireTestWrapper>,
  );

describe('DeadlineNotice', () => {
  it('shows when the questionnaire is due, in Eastern time', async () => {
    const { findByText } = renderNotice({ deadline });

    expect(
      await findByText(
        "Due Jan 20, 2027, 5:00 PM EST. After that you can't change or submit it.",
      ),
    ).toBeInTheDocument();
  });

  it('says the deadline passed and who can reopen it', async () => {
    const { findByText } = renderNotice({ deadline, locked: true });

    expect(
      await findByText(
        'The deadline for this questionnaire passed on Jan 20, 2027, 5:00 PM EST. To change or submit it, ask the MPD team at mpdhelp@cru.org to reopen it.',
      ),
    ).toBeInTheDocument();
  });

  it('says nothing once the questionnaire is submitted', async () => {
    const { findByText, queryByText } = renderNotice({
      deadline,
      locked: true,
      completed: true,
    });
    // Wait for the query, so the empty result is the notice's answer and not loading
    await findByText('loaded');

    expect(queryByText(/deadline|Due/)).not.toBeInTheDocument();
  });
});
