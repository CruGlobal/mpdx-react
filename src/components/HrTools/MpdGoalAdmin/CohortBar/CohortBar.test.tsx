import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdminProvider } from '../MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from '../NewStaffCohorts.generated';
import {
  attendeesMock,
  cohortsMock,
  cohortsWithoutCostsMock,
} from '../mpdGoalAdminMocks';
import { CohortBar } from './CohortBar';

const mutationSpy = jest.fn();

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

interface TestComponentProps {
  /** Renders a cohort whose costs have never been entered. */
  withoutCosts?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  withoutCosts = false,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider<{
        NewStaffCohorts: NewStaffCohortsQuery;
        NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
      }>
        mocks={{
          NewStaffCohorts: withoutCosts ? cohortsWithoutCostsMock : cohortsMock,
          NewStaffCohortAttendees: attendeesMock(),
        }}
        onCall={mutationSpy}
      >
        <MpdGoalAdminProvider>
          <CohortBar />
        </MpdGoalAdminProvider>
      </GqlMockedProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

/**
 * Opens the lazily-loaded modal and waits for it to mount. Waits for the cohort
 * first: clicking before the query resolves opens the modal with no cohort, so
 * it renders the generic title and prefills nothing.
 */
const openModal = async (screen: ReturnType<typeof render>) => {
  await screen.findByText('Fall NSO 2026');
  userEvent.click(screen.getByRole('button', { name: 'View/Edit' }));
  return screen.findByRole('heading', { name: /Training Costs for/ });
};

describe('CohortBar', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
    mockEnqueue.mockClear();
  });

  it('renders the selected cohort name and summary stats', async () => {
    const { findByText, findByRole } = render(<TestComponent />);

    await findByText('Fall NSO 2026');
    expect(
      await findByRole('combobox', { name: 'Training' }),
    ).toHaveTextContent('Fall NSO 2026');
    expect(await findByText('13 New Staff')).toBeInTheDocument();
    expect(await findByText('8/10/2026')).toBeInTheDocument();
  });

  it('opens the Edit Training Costs modal for the selected cohort', async () => {
    const screen = render(<TestComponent />);
    const { queryByRole } = screen;

    expect(
      queryByRole('heading', { name: 'Training Costs for Fall NSO 2026' }),
    ).not.toBeInTheDocument();

    // The modal is lazy-loaded via next/dynamic, so it resolves asynchronously.
    expect(await openModal(screen)).toHaveTextContent(
      'Training Costs for Fall NSO 2026',
    );
  });

  it('prefills the modal with the cohort saved costs', async () => {
    const screen = render(<TestComponent />);
    const { findByRole } = screen;
    await openModal(screen);

    expect(
      await findByRole('spinbutton', { name: /Individual \(1 in room\)/ }),
    ).toHaveValue(100);
    expect(
      await findByRole('spinbutton', { name: /Individual \(2 in room\)/ }),
    ).toHaveValue(200);
    // "Family" appears in both the NSO and Cru Conference sections, so scope
    // the lookup to the section to keep the two apart.
    const cruConference = within(
      await findByRole('group', { name: 'Cru Conference' }),
    );
    expect(
      cruConference.getByRole('spinbutton', { name: /Family/ }),
    ).toHaveValue(1300);
  });

  it('saves the costs through the mutation and toasts on success', async () => {
    const screen = render(<TestComponent />);
    const { findByRole, queryByRole } = screen;
    await openModal(screen);

    userEvent.click(await findByRole('button', { name: 'Apply' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateNewStaffCohort', {
        input: {
          id: 'fall-nso-2026',
          attributes: {
            nsoIndividual1InRoomCost: 100,
            nsoIndividual2InRoomCost: 200,
            nsoCoupleCost: 300,
            nsoFamilyCost: 400,
            ibsSingleCost: 500,
            ibsCoupleCost: 600,
            refreshRetreatSingleCost: 700,
            refreshRetreatCoupleCost: 800,
            faithAndFinanceSingleCost: 900,
            faithAndFinanceCoupleCost: 1000,
            cruConferenceSingleCost: 1100,
            cruConferenceCoupleCost: 1200,
            cruConferenceFamilyCost: 1300,
          },
        },
      }),
    );

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Per-Training Cost applied successfully.',
        { variant: 'success' },
      ),
    );
    // A successful save closes the modal.
    await waitFor(() =>
      expect(
        queryByRole('heading', { name: /Training Costs for/ }),
      ).not.toBeInTheDocument(),
    );
  });

  it('keeps APPLY disabled until every cost is entered', async () => {
    const screen = render(<TestComponent withoutCosts />);
    const { findByRole } = screen;
    await openModal(screen);

    // The cohort has no saved costs, so the form opens blank.
    expect(await findByRole('button', { name: 'Apply' })).toBeDisabled();

    userEvent.type(
      await findByRole('spinbutton', { name: /Individual \(1 in room\)/ }),
      '100',
    );
    expect(await findByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('leaves the modal open and does not toast when the save fails', async () => {
    const screen = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <GqlMockedProvider<{
            NewStaffCohorts: NewStaffCohortsQuery;
            NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
          }>
            mocks={{
              NewStaffCohorts: cohortsMock,
              NewStaffCohortAttendees: attendeesMock(),
              UpdateNewStaffCohort: {
                updateNewStaffCohort: () => {
                  throw new Error('Not authorized');
                },
              },
            }}
            onCall={mutationSpy}
          >
            <MpdGoalAdminProvider>
              <CohortBar />
            </MpdGoalAdminProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    const { findByRole, getByRole } = screen;
    await openModal(screen);

    const apply = await findByRole('button', { name: 'Apply' });
    userEvent.click(apply);

    // The failed save has fully settled once the mutation has fired and Formik
    // has re-enabled Apply (isSubmitting clears only after the catch runs).
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateNewStaffCohort'),
    );
    await waitFor(() => expect(apply).toBeEnabled());

    // The global Apollo error link owns the failure toast, so this component
    // must not add a second one — and the entered costs stay on screen.
    expect(mockEnqueue).not.toHaveBeenCalled();
    expect(
      getByRole('heading', { name: /Training Costs for/ }),
    ).toBeInTheDocument();
  });
});
