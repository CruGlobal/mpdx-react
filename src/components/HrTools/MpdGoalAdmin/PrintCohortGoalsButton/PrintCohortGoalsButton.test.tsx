import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { TrainingCosts } from '../mpdGoalAdminHelpers';
import { PrintCohortGoalsButton } from './PrintCohortGoalsButton';
import { downloadPdf, generateCohortGoalsPdf } from './printCohortGoalsPdf';

jest.mock('./printCohortGoalsPdf');

const generateMock = generateCohortGoalsPdf as jest.MockedFunction<
  typeof generateCohortGoalsPdf
>;
const downloadMock = downloadPdf as jest.MockedFunction<typeof downloadPdf>;

// Test harness exposing context so we can switch cohorts.
let ctx: ReturnType<typeof useMpdGoalAdmin>;
const Capture: React.FC = () => {
  ctx = useMpdGoalAdmin();
  return <PrintCohortGoalsButton />;
};

const renderButton = () =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <MpdGoalAdminProvider>
          <Capture />
        </MpdGoalAdminProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

describe('PrintCohortGoalsButton', () => {
  beforeEach(() => {
    generateMock.mockResolvedValue('blob:mock-pdf');
  });

  it('is disabled with an explanation until the cohort has training costs', async () => {
    const { getByRole, findByText } = renderButton();
    // The spring cohort's training costs have not been entered yet.
    act(() => ctx.setSelectedCohortId('spring-nso-2027'));

    const button = getByRole('button', { name: 'Print All' });
    expect(button).toBeDisabled();

    await userEvent.hover(button.parentElement as HTMLElement);
    expect(
      await findByText(
        'Enter training costs for this cohort to print its goals.',
      ),
    ).toBeInTheDocument();
  });

  it('becomes enabled once training costs are entered', () => {
    const { getByRole } = renderButton();
    act(() => ctx.setSelectedCohortId('spring-nso-2027'));
    expect(getByRole('button', { name: 'Print All' })).toBeDisabled();

    const trainingCosts: TrainingCosts = {
      nsoIndividual1InRoom: 100,
      nsoIndividual2InRoom: 200,
      nsoCouple: 300,
      nsoFamily: 400,
      ibsSingle: 500,
      ibsCouple: 600,
      refreshRetreatSingle: 700,
      refreshRetreatCouple: 800,
      faithAndFinanceSingle: 900,
      faithAndFinanceCouple: 1000,
      cruConferenceSingle: 1100,
      cruConferenceCouple: 1200,
      cruConferenceFamily: 1300,
    };
    act(() => ctx.saveTrainingCosts('spring-nso-2027', trainingCosts));
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });

  it('generates the cohort PDF and downloads it', async () => {
    const { getByRole } = renderButton();
    await userEvent.click(getByRole('button', { name: 'Print All' }));

    await waitFor(() =>
      expect(downloadMock).toHaveBeenCalledWith(
        'blob:mock-pdf',
        'MPD Goals - Fall NSO 2026.pdf',
      ),
    );
    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'fall-nso-2026' }),
    );
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });

  it('shows an error and re-enables the button when generation fails', async () => {
    generateMock.mockRejectedValue(new Error('boom'));
    const { getByRole, findByText } = renderButton();
    await userEvent.click(getByRole('button', { name: 'Print All' }));

    expect(
      await findByText('Unable to export the MPD Goals PDF.'),
    ).toBeInTheDocument();
    expect(downloadMock).not.toHaveBeenCalled();
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });
});
