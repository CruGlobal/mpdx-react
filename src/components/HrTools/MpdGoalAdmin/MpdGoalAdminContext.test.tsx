import React from 'react';
import { Operation } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from './MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from './NewStaffCohorts.generated';
import { MpdGoalAdminTabEnum } from './mpdGoalAdminHelpers';
import {
  attendees,
  attendeesMock,
  cohortsMock,
  trainingCosts,
} from './mpdGoalAdminMocks';

const mutationSpy = jest.fn();

const makeWrapper = (
  mocks: {
    cohorts?: NewStaffCohortsQuery;
    attendees?:
      | NewStaffCohortAttendeesQuery
      | ((operation: Operation) => NewStaffCohortAttendeesQuery);
  } = {},
): React.FC<{ children: React.ReactNode }> =>
  function Wrapper({ children }) {
    return (
      <GqlMockedProvider<{
        NewStaffCohorts: NewStaffCohortsQuery;
        NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
      }>
        mocks={{
          NewStaffCohorts: mocks.cohorts ?? cohortsMock,
          NewStaffCohortAttendees: (mocks.attendees ??
            attendeesMock()) as unknown as NewStaffCohortAttendeesQuery,
        }}
        onCall={mutationSpy}
      >
        <MpdGoalAdminProvider>{children}</MpdGoalAdminProvider>
      </GqlMockedProvider>
    );
  };

const renderContext = () =>
  renderHook(() => useMpdGoalAdmin(), { wrapper: makeWrapper() });

/** Resolves once both queries have populated the context. */
const renderLoaded = async () => {
  const rendered = renderContext();
  await waitFor(() =>
    expect(rendered.result.current.filteredRows).not.toHaveLength(0),
  );
  return rendered;
};

describe('MpdGoalAdminContext', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
  });

  it('defaults to the active-goals tab and the first cohort from the query', async () => {
    const { result } = await renderLoaded();

    expect(result.current.activeTab).toBe(MpdGoalAdminTabEnum.ActiveGoals);
    expect(result.current.selectedCohort?.id).toBe('fall-nso-2026');
    expect(result.current.selectedCohort?.name).toBe('Fall NSO 2026');
    expect(result.current.selectedCohort?.nsoDate).toBe('8/10/2026');
    expect(result.current.selectedCohort?.trainingCosts).toEqual(trainingCosts);
  });

  it('leaves trainingCosts undefined when the cohort has none', async () => {
    const { result } = await renderLoaded();

    const withoutCosts = result.current.cohorts.find(
      (cohort) => cohort.id === 'spring-nso-2027',
    );
    expect(withoutCosts?.hasTrainingCosts).toBe(false);
    expect(withoutCosts?.trainingCosts).toBeUndefined();
  });

  it('maps attendees onto table rows', async () => {
    const { result } = await renderLoaded();

    expect(result.current.filteredRows[0]).toEqual({
      id: 'row-1',
      name: 'John & Jane Doe',
      ministry: 'Campus',
      geography: 'Orlando, FL',
      mpdGoal: 6430.25,
      goalStatus: 'COMPLETE',
      familyStatus: 'MARRIED',
      coach: null,
      coordinator: 'Kim Coordinator',
    });
    // An attendee with no goal calculation yet still renders, at $0.
    expect(result.current.filteredRows[1].mpdGoal).toBe(0);
    expect(result.current.filteredRows[1].coach).toBe('Nelson Jones');
  });

  it('toggles row selection and clears it', async () => {
    const { result } = await renderLoaded();

    act(() => result.current.toggleRow('row-1'));
    expect(result.current.selectedRowIds.has('row-1')).toBe(true);
    act(() => result.current.toggleRow('row-1'));
    expect(result.current.selectedRowIds.has('row-1')).toBe(false);
    act(() => result.current.toggleRow('row-2'));
    act(() => result.current.clearSelection());
    expect(result.current.selectedRowIds.size).toBe(0);
  });

  it('excludes rows the query did not return from selectedRows without forgetting them', async () => {
    const { result } = await renderLoaded();

    act(() => result.current.toggleRow('row-1'));
    act(() => result.current.toggleRow('not-in-this-cohort'));

    // The count can't lie: only rows actually on screen are reported...
    expect(result.current.selectedRows.map((row) => row.id)).toEqual(['row-1']);
    // ...but the id is kept, so it returns if that row comes back.
    expect(result.current.selectedRowIds.has('not-in-this-cohort')).toBe(true);
  });

  it('finishes loading with an empty state when there are no cohorts', async () => {
    const { result } = renderHook(() => useMpdGoalAdmin(), {
      wrapper: makeWrapper({
        cohorts: {
          newStaffCohorts: {
            nodes: [],
            pageInfo: { endCursor: null, hasNextPage: false },
          },
        },
      }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cohorts).toHaveLength(0);
    expect(result.current.selectedCohort).toBeUndefined();
    expect(result.current.filteredRows).toHaveLength(0);
  });

  it('drains every attendees page before reporting loaded', async () => {
    const [firstAttendee, ...restAttendees] = attendees;
    const pageOne: NewStaffCohortAttendeesQuery = {
      newStaffCohort: {
        id: 'fall-nso-2026',
        attendees: {
          nodes: [firstAttendee],
          pageInfo: { endCursor: 'page-2', hasNextPage: true },
        },
      },
    };
    const pageTwo = attendeesMock(restAttendees);
    const { result } = renderHook(() => useMpdGoalAdmin(), {
      wrapper: makeWrapper({
        attendees: (operation) =>
          operation.variables.after === 'page-2' ? pageTwo : pageOne,
      }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.filteredRows.map((row) => row.id)).toEqual([
      'row-1',
      'row-2',
      'row-3',
    ]);
  });

  it('sends the debounced search term to the attendees query', async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setSearch('carlos'));

    await waitFor(
      () =>
        expect(mutationSpy).toHaveGraphqlOperation('NewStaffCohortAttendees', {
          cohortId: 'fall-nso-2026',
          search: 'carlos',
        }),
      { timeout: 3000 },
    );
  });

  it('clears the selection when the cohort changes', async () => {
    const { result } = await renderLoaded();

    act(() => result.current.toggleRow('row-1'));
    expect(result.current.selectedRowIds.size).toBe(1);

    act(() => result.current.setSelectedCohortId('spring-nso-2027'));
    expect(result.current.selectedRowIds.size).toBe(0);
  });

  it('saves every training cost through the update mutation', async () => {
    const { result } = await renderLoaded();

    await act(() =>
      result.current.saveTrainingCosts('fall-nso-2026', trainingCosts),
    );

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
    });
  });

  it('refetches the attendees after saving costs, so goal amounts update', async () => {
    const { result } = await renderLoaded();
    const callsBefore = mutationSpy.mock.calls.filter(
      ([{ operation }]) =>
        operation.operationName === 'NewStaffCohortAttendees',
    ).length;

    await act(() =>
      result.current.saveTrainingCosts('fall-nso-2026', trainingCosts),
    );

    const callsAfter = mutationSpy.mock.calls.filter(
      ([{ operation }]) =>
        operation.operationName === 'NewStaffCohortAttendees',
    ).length;
    expect(callsAfter).toBeGreaterThan(callsBefore);
  });

  it('assigns a coach to exactly the given rows', async () => {
    const { result } = await renderLoaded();

    act(() => result.current.assignCoach(['row-1', 'row-3'], 'Tom Harris'));

    const byId = (id: string) =>
      result.current.filteredRows.find((row) => row.id === id);
    expect(byId('row-1')?.coach).toBe('Tom Harris');
    expect(byId('row-3')?.coach).toBe('Tom Harris');
    expect(byId('row-2')?.coach).toBe('Nelson Jones');
  });

  it('throws when used outside its provider', () => {
    expect(() => renderHook(() => useMpdGoalAdmin())).toThrow(
      'useMpdGoalAdmin must be used within a MpdGoalAdminProvider',
    );
  });
});
