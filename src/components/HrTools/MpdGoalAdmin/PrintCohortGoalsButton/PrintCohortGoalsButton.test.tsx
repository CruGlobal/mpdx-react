import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import {
  attendeesMock,
  cohortsMock,
  trainingCosts,
  updatedCohortMock,
} from '../mpdGoalAdminMocks';
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
        <GqlMockedProvider
          mocks={{
            NewStaffCohorts: cohortsMock,
            NewStaffCohortAttendees: attendeesMock(),
            UpdateNewStaffCohort: updatedCohortMock('spring-nso-2027'),
          }}
        >
          <MpdGoalAdminProvider>
            <Capture />
          </MpdGoalAdminProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

/** Waits for the cohorts query, without which no cohort is selected. */
const waitForCohorts = () =>
  waitFor(() => expect(ctx.cohorts).not.toHaveLength(0));

describe('PrintCohortGoalsButton', () => {
  beforeEach(() => {
    generateMock.mockResolvedValue('blob:mock-pdf');
  });

  it('is disabled with an explanation until the cohort has training costs', async () => {
    const { getByRole, findByText } = renderButton();
    await waitForCohorts();
    // The spring cohort's training costs have not been entered yet.
    act(() => ctx.setSelectedCohortId('spring-nso-2027'));

    const button = getByRole('button', { name: 'Print All' });
    expect(button).toBeDisabled();

    userEvent.hover(button.parentElement as HTMLElement);
    expect(
      await findByText(
        'Enter training costs for this cohort to print its goals.',
      ),
    ).toBeInTheDocument();
  });

  it('becomes enabled once training costs are entered', async () => {
    const { getByRole } = renderButton();
    await waitForCohorts();
    act(() => ctx.setSelectedCohortId('spring-nso-2027'));
    expect(getByRole('button', { name: 'Print All' })).toBeDisabled();

    // The mutation returns the updated cohort, which normalizes into the cache
    // and clears the gate — no cohort refetch involved.
    await act(() => ctx.saveTrainingCosts('spring-nso-2027', trainingCosts));

    await waitFor(() =>
      expect(getByRole('button', { name: 'Print All' })).toBeEnabled(),
    );
  });

  it('relabels to Print Matching while a search is active', async () => {
    const { getByRole } = renderButton();
    await waitForCohorts();

    act(() => ctx.setSearch('john'));

    expect(getByRole('button', { name: 'Print Matching' })).toBeInTheDocument();
  });

  it('generates the cohort PDF and downloads it', async () => {
    const { getByRole } = renderButton();
    await waitForCohorts();
    userEvent.click(getByRole('button', { name: 'Print All' }));

    await waitFor(() =>
      expect(downloadMock).toHaveBeenCalledWith(
        'blob:mock-pdf',
        'MPD Goals - Fall NSO 2026.pdf',
      ),
    );
    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'fall-nso-2026' }),
      expect.arrayContaining([
        expect.objectContaining({ name: 'John & Jane Doe' }),
      ]),
    );
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });

  it('disables the button and shows a spinner while generating', async () => {
    let resolvePdf!: (url: string) => void;
    generateMock.mockReturnValue(
      new Promise((resolve) => (resolvePdf = resolve)),
    );
    const { getByRole, findByRole } = renderButton();
    await waitForCohorts();
    userEvent.click(getByRole('button', { name: 'Print All' }));

    expect(await findByRole('progressbar')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Print All' })).toBeDisabled();

    resolvePdf('blob:mock-pdf');
    await waitFor(() => expect(downloadMock).toHaveBeenCalled());
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });

  it('shows an error and re-enables the button when generation fails', async () => {
    generateMock.mockRejectedValue(new Error('boom'));
    const { getByRole, findByText } = renderButton();
    await waitForCohorts();
    userEvent.click(getByRole('button', { name: 'Print All' }));

    expect(
      await findByText('Unable to export the MPD Goals PDF.'),
    ).toBeInTheDocument();
    expect(downloadMock).not.toHaveBeenCalled();
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });
});
