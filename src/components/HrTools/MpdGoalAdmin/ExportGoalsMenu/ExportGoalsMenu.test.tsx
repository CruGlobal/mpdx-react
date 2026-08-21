import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { TrainingCosts } from '../mpdGoalAdminHelpers';
import { ExportGoalsMenu } from './ExportGoalsMenu';
import { downloadPdf, generateCohortGoalsPdf } from './printCohortGoalsPdf';

jest.mock('./printCohortGoalsPdf');

const generateMock = generateCohortGoalsPdf as jest.MockedFunction<
  typeof generateCohortGoalsPdf
>;
const downloadMock = downloadPdf as jest.MockedFunction<typeof downloadPdf>;

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

// Test harness exposing context so we can switch cohorts.
let ctx: ReturnType<typeof useMpdGoalAdmin>;
const Capture: React.FC = () => {
  ctx = useMpdGoalAdmin();
  return <ExportGoalsMenu />;
};

const renderMenu = () =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <MpdGoalAdminProvider>
          <Capture />
        </MpdGoalAdminProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

describe('ExportGoalsMenu', () => {
  beforeEach(() => {
    generateMock.mockResolvedValue('blob:mock-pdf');
  });

  it('opens from a button that stays available with no rows selected', async () => {
    const { getByRole, findByRole } = renderMenu();
    const button = getByRole('button', { name: 'Export' });
    expect(button).toBeEnabled();

    userEvent.click(button);
    expect(await findByRole('menu')).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Print All' })).toBeEnabled();
  });

  it('explains the cohort-wide scope while Print All is available', async () => {
    const { getByRole, findByText } = renderMenu();
    userEvent.click(getByRole('button', { name: 'Export' }));
    expect(
      await findByText('Prints every goal in Fall NSO 2026.'),
    ).toBeInTheDocument();
  });

  it('disables Print All with a visible reason until the cohort has training costs', async () => {
    const { getByRole, findByText } = renderMenu();
    // The spring cohort's training costs have not been entered yet.
    act(() => ctx.setSelectedCohortId('spring-nso-2027'));

    userEvent.click(getByRole('button', { name: 'Export' }));
    expect(
      await findByText(
        'Enter training costs for this cohort to print its goals.',
      ),
    ).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Print All' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('enables Print All once training costs are entered', async () => {
    const { getByRole, findByRole } = renderMenu();
    act(() => ctx.setSelectedCohortId('spring-nso-2027'));

    userEvent.click(getByRole('button', { name: 'Export' }));
    expect(await findByRole('menuitem', { name: 'Print All' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    act(() => ctx.saveTrainingCosts('spring-nso-2027', trainingCosts));
    expect(getByRole('menuitem', { name: 'Print All' })).toBeEnabled();
  });

  it('generates the cohort PDF and downloads it', async () => {
    const { getByRole, findByRole } = renderMenu();
    userEvent.click(getByRole('button', { name: 'Export' }));
    userEvent.click(await findByRole('menuitem', { name: 'Print All' }));

    await waitFor(() =>
      expect(downloadMock).toHaveBeenCalledWith(
        'blob:mock-pdf',
        'MPD Goals - Fall NSO 2026.pdf',
      ),
    );
    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'fall-nso-2026' }),
    );
  });

  it('marks the button busy and blocks a second print while generating', async () => {
    let resolvePdf!: (url: string) => void;
    generateMock.mockReturnValue(
      new Promise((resolve) => (resolvePdf = resolve)),
    );
    const { getByRole, findByRole } = renderMenu();
    userEvent.click(getByRole('button', { name: 'Export' }));
    userEvent.click(await findByRole('menuitem', { name: 'Print All' }));

    const button = getByRole('button', { name: 'Export' });
    await waitFor(() => expect(button).toHaveAttribute('aria-busy', 'true'));
    expect(await findByRole('progressbar')).toBeInTheDocument();

    // Reopening while in flight must not allow a second export.
    userEvent.click(button);
    expect(await findByRole('menuitem', { name: 'Print All' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    resolvePdf('blob:mock-pdf');
    await waitFor(() => expect(downloadMock).toHaveBeenCalled());
    await waitFor(() => expect(button).toHaveAttribute('aria-busy', 'false'));
  });

  it('shows an error and stays usable when generation fails', async () => {
    generateMock.mockRejectedValue(new Error('boom'));
    const { getByRole, findByRole, findByText } = renderMenu();
    userEvent.click(getByRole('button', { name: 'Export' }));
    userEvent.click(await findByRole('menuitem', { name: 'Print All' }));

    expect(
      await findByText('Unable to export the MPD Goals PDF.'),
    ).toBeInTheDocument();
    expect(downloadMock).not.toHaveBeenCalled();
    expect(getByRole('button', { name: 'Export' })).toBeEnabled();
  });
});
