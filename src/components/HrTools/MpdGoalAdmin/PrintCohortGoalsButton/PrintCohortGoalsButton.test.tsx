import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
  PrintNewStaffCohortGoalsMutation,
  UpdateNewStaffCohortMutation,
} from '../NewStaffCohorts.generated';
import {
  attendeesMock,
  cohortsMock,
  printedGoalsMock,
  trainingCosts,
  updatedCohortMock,
} from '../mpdGoalAdminMocks';
import { PrintCohortGoalsButton } from './PrintCohortGoalsButton';
import { downloadPdf, fetchCohortGoalsPdf } from './printCohortGoalsPdf';

jest.mock('./printCohortGoalsPdf');

const fetchPdfMock = fetchCohortGoalsPdf as jest.MockedFunction<
  typeof fetchCohortGoalsPdf
>;
const downloadMock = downloadPdf as jest.MockedFunction<typeof downloadPdf>;
const mutationSpy = jest.fn();

// Test harness exposing context so we can switch cohorts.
let ctx: ReturnType<typeof useMpdGoalAdmin>;
const Capture: React.FC = () => {
  ctx = useMpdGoalAdmin();
  return <PrintCohortGoalsButton />;
};

const renderButton = (
  printGoals: PrintNewStaffCohortGoalsMutation = printedGoalsMock(3),
) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          NewStaffCohorts: NewStaffCohortsQuery;
          NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
          UpdateNewStaffCohort: UpdateNewStaffCohortMutation;
          PrintNewStaffCohortGoals: PrintNewStaffCohortGoalsMutation;
        }>
          mocks={{
            NewStaffCohorts: cohortsMock,
            NewStaffCohortAttendees: attendeesMock(),
            UpdateNewStaffCohort: updatedCohortMock('spring-nso-2027'),
            PrintNewStaffCohortGoals: printGoals,
          }}
          onCall={mutationSpy}
        >
          <TestRouter>
            <MpdGoalAdminProvider>
              <Capture />
            </MpdGoalAdminProvider>
          </TestRouter>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

/** Waits for the cohorts query and the auto-select that follows it, which would otherwise overwrite a selection the test makes. */
const waitForCohorts = () =>
  waitFor(() => expect(ctx.selectedCohortId).not.toBe(''));

describe('PrintCohortGoalsButton', () => {
  beforeEach(() => {
    fetchPdfMock.mockResolvedValue('blob:goals-pdf');
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
    const button = getByRole('button', { name: 'Print All' });
    expect(button).toBeDisabled();

    // The mutation's cohort normalizes into the cache, clearing the gate.
    await act(() => ctx.saveTrainingCosts('spring-nso-2027', trainingCosts));

    // findBy* can't wait on an enabled-state change, so waitFor the attribute.
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('relabels to Print Matching while a search is active', async () => {
    const { getByRole } = renderButton();
    await waitForCohorts();

    act(() => ctx.setSearch('john'));

    expect(getByRole('button', { name: 'Print Matching' })).toBeInTheDocument();
  });

  it('prints the whole cohort and downloads the worksheets', async () => {
    const { getByRole } = renderButton();
    await waitForCohorts();
    userEvent.click(getByRole('button', { name: 'Print All' }));

    await waitFor(() =>
      expect(downloadMock).toHaveBeenCalledWith(
        'blob:goals-pdf',
        'MPD Goals - Fall NSO 2026.pdf',
      ),
    );
    expect(fetchPdfMock).toHaveBeenCalledWith(
      'https://api.mpdx.org/exports/token-1.pdf',
      'apiToken',
    );
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });

  // filteredRows holds only the pages fetched so far, so ids could print a subset of the training.
  it('omits attendeeIds when unsearched so the server prints every household', async () => {
    const { getByRole } = renderButton();
    await waitForCohorts();
    userEvent.click(getByRole('button', { name: 'Print All' }));

    await waitFor(() => expect(downloadMock).toHaveBeenCalled());
    expect(mutationSpy).toHaveGraphqlOperation('PrintNewStaffCohortGoals', {
      input: { cohortId: 'fall-nso-2026' },
    });
    const [{ operation }] = mutationSpy.mock.calls.find(
      ([{ operation }]) =>
        operation.operationName === 'PrintNewStaffCohortGoals',
    );
    expect(operation.variables.input).not.toHaveProperty('attendeeIds');
  });

  it('scopes the print to the matching rows while a search is active', async () => {
    const { getByRole } = renderButton();
    await waitForCohorts();
    await waitFor(() => expect(ctx.filteredRows).not.toHaveLength(0));
    const matchingIds = ctx.filteredRows.map((row) => row.id);

    act(() => ctx.setSearch('john'));
    userEvent.click(getByRole('button', { name: 'Print Matching' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PrintNewStaffCohortGoals', {
        input: { cohortId: 'fall-nso-2026', attendeeIds: matchingIds },
      }),
    );
  });

  it('warns about households left out for having no goal calculation', async () => {
    const { getByRole, findByText } = renderButton(printedGoalsMock(3, 2));
    await waitForCohorts();
    userEvent.click(getByRole('button', { name: 'Print All' }));

    expect(
      await findByText(
        '2 households have no MPD goal calculation yet and were left out.',
      ),
    ).toBeInTheDocument();
    expect(downloadMock).toHaveBeenCalled();
  });

  it('reports that nothing was printable instead of downloading an empty file', async () => {
    const { getByRole, findByText } = renderButton(
      printedGoalsMock(0, 4, null),
    );
    await waitForCohorts();
    userEvent.click(getByRole('button', { name: 'Print All' }));

    expect(
      await findByText('No MPD goals are ready to print.'),
    ).toBeInTheDocument();
    expect(fetchPdfMock).not.toHaveBeenCalled();
    expect(downloadMock).not.toHaveBeenCalled();
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });

  it('disables the button and shows a spinner while printing', async () => {
    let resolvePdf!: (url: string) => void;
    fetchPdfMock.mockReturnValue(
      new Promise((resolve) => (resolvePdf = resolve)),
    );
    const { getByRole, findByRole } = renderButton();
    await waitForCohorts();
    userEvent.click(getByRole('button', { name: 'Print All' }));

    expect(await findByRole('progressbar')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Print All' })).toBeDisabled();

    resolvePdf('blob:goals-pdf');
    await waitFor(() => expect(downloadMock).toHaveBeenCalled());
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });

  // The single-use token is already burned, so this is the one failure with no global toast.
  it('shows an error and re-enables the button when the download fails', async () => {
    fetchPdfMock.mockRejectedValue(new Error('boom'));
    const { getByRole, findByText } = renderButton();
    await waitForCohorts();
    userEvent.click(getByRole('button', { name: 'Print All' }));

    expect(
      await findByText('Unable to download the MPD Goals PDF.'),
    ).toBeInTheDocument();
    expect(downloadMock).not.toHaveBeenCalled();
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });
});
