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
  UpdateNewStaffCohortMutation,
} from '../NewStaffCohorts.generated';
import {
  attendeesMock,
  cohortsMock,
  cohortsWithoutCostsMock,
  updatedCohortMock,
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
        UpdateNewStaffCohort: UpdateNewStaffCohortMutation;
      }>
        mocks={{
          NewStaffCohorts: withoutCosts ? cohortsWithoutCostsMock : cohortsMock,
          NewStaffCohortAttendees: attendeesMock(),
          // Normalizes over the selected cohort so a save clears the gate.
          UpdateNewStaffCohort: updatedCohortMock('fall-nso-2026'),
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

/** Waits for the cohort first; clicking early opens the modal with no cohort. */
const openModal = async (
  screen: ReturnType<typeof render>,
  // A cohort missing its costs prompts to provide them instead.
  name: string = 'View/Edit',
) => {
  await screen.findByText('Fall NSO 2026');
  userEvent.click(screen.getByRole('button', { name }));
  return screen.findByRole('heading', { name: /Training Costs for/ });
};

describe('CohortBar', () => {
  it('renders the selected cohort name and summary stats', async () => {
    const { findByText, findByRole } = render(<TestComponent />);

    await findByText('Fall NSO 2026');
    expect(
      await findByRole('combobox', { name: 'Training' }),
    ).toHaveTextContent('Fall NSO 2026');
    expect(await findByText('13 New Staff')).toBeInTheDocument();
    expect(await findByText('8/10/2026')).toBeInTheDocument();
  });

  it('renders the disabled View/Edit link while the cohort is still loading', () => {
    const { getByRole, queryByRole } = render(<TestComponent withoutCosts />);

    // The prompt must not flash before the cohorts query has resolved.
    expect(getByRole('button', { name: 'View/Edit' })).toBeDisabled();
    expect(
      queryByRole('button', { name: 'Provide Training Cost' }),
    ).not.toBeInTheDocument();
  });

  it('prompts to provide the costs when the cohort has none', async () => {
    const { findByText, findByRole, queryByRole } = render(
      <TestComponent withoutCosts />,
    );

    await findByText('Fall NSO 2026');
    expect(
      await findByRole('button', { name: 'Provide Training Cost' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'View/Edit' }),
    ).not.toBeInTheDocument();
  });

  it('explains why the costs are needed when the cohort has none', async () => {
    const { findByText, findByRole } = render(<TestComponent withoutCosts />);

    await findByText('Fall NSO 2026');
    const prompt = await findByRole('button', {
      name: 'Provide Training Cost',
    });

    userEvent.hover(prompt);
    expect(
      await findByText('Training costs are required to run & send goals.'),
    ).toBeInTheDocument();
  });

  it('opens the modal from the Provide Training Cost prompt', async () => {
    const screen = render(<TestComponent withoutCosts />);
    const { findByText, findByRole, getByRole } = screen;

    await findByText('Fall NSO 2026');
    userEvent.click(getByRole('button', { name: 'Provide Training Cost' }));

    expect(
      await findByRole('heading', { name: /Training Costs for/ }),
    ).toHaveTextContent('Training Costs for Fall NSO 2026');
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
    // "Family" appears in two sections, so scope the lookup to one.
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
    await waitFor(() =>
      expect(
        queryByRole('heading', { name: /Training Costs for/ }),
      ).not.toBeInTheDocument(),
    );
  });

  it('replaces the prompt with View/Edit once the costs are saved', async () => {
    const screen = render(<TestComponent withoutCosts />);
    const { findByRole, getAllByRole, queryByRole } = screen;
    await openModal(screen, 'Provide Training Cost');

    // Apply stays disabled until all thirteen costs are entered.
    getAllByRole('spinbutton').forEach((input, index) =>
      userEvent.type(input, String((index + 1) * 100)),
    );
    const apply = await findByRole('button', { name: 'Apply' });
    await waitFor(() => expect(apply).toBeEnabled());
    userEvent.click(apply);

    expect(await findByRole('button', { name: 'View/Edit' })).toBeEnabled();
    expect(
      queryByRole('button', { name: 'Provide Training Cost' }),
    ).not.toBeInTheDocument();
    // Typing all thirteen fields exceeds the default 5s timeout under load.
  }, 20000);

  it('keeps APPLY disabled until every cost is entered', async () => {
    const screen = render(<TestComponent withoutCosts />);
    const { findByRole } = screen;
    await openModal(screen, 'Provide Training Cost');

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

    // Apply re-enables only after the catch runs, so the failure has settled.
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateNewStaffCohort'),
    );
    await waitFor(() => expect(apply).toBeEnabled());

    // The global error link owns the failure toast; this must not add a second.
    expect(mockEnqueue).not.toHaveBeenCalled();
    expect(
      getByRole('heading', { name: /Training Costs for/ }),
    ).toBeInTheDocument();
  });
});
