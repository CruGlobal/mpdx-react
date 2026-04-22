import React from 'react';
import { GridValidRowModel } from '@mui/x-data-grid';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  PdsGoalCalculationMock,
  PdsGoalCalculatorTestWrapper,
} from '../../PdsGoalCalculatorTestWrapper';
import { useHoursPerWeekGrid } from './useHoursPerWeekGrid';

const defaultCalculationMock: PdsGoalCalculationMock = {
  id: 'goal-1',
  designationSupportHoursItems: [
    {
      id: 'item-regular',
      label: 'Regular Week',
      hoursPerWeek: 40,
      numberOfWeeks: 48,
      name: 'regular',
      position: 0,
      predefined: true,
    },
    {
      id: 'item-travel',
      label: 'Travel',
      hoursPerWeek: 0,
      numberOfWeeks: 0,
      name: 'travel',
      position: 1,
      predefined: true,
    },
    {
      id: 'item-vacation',
      label: 'Unpaid Vacation',
      hoursPerWeek: 0,
      numberOfWeeks: 0,
      name: 'vacation',
      position: 2,
      predefined: true,
    },
  ],
};

const mutationSpy = jest.fn();

const createWrapper = (
  calculationMock: PdsGoalCalculationMock = defaultCalculationMock,
): React.FC<{ children: React.ReactNode }> => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <PdsGoalCalculatorTestWrapper
      calculationMock={calculationMock}
      onCall={mutationSpy}
    >
      {children}
    </PdsGoalCalculatorTestWrapper>
  );
  return Wrapper;
};

const waitForDataToLoad = async () => {
  await waitFor(() =>
    expect(mutationSpy).toHaveGraphqlOperation('PdsGoalCalculation'),
  );
};

describe('useHoursPerWeekGrid', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
  });

  it('initializes entries from server data sorted by position', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(3);
    });

    expect(result.current.entries[0]).toMatchObject({
      id: 'item-regular',
      label: 'Regular Week',
      hoursPerWeek: 40,
      weeks: 48,
      position: 0,
    });
    expect(result.current.entries[1]).toMatchObject({
      id: 'item-travel',
      label: 'Travel',
      position: 1,
    });
    expect(result.current.entries[2]).toMatchObject({
      id: 'item-vacation',
      label: 'Unpaid Vacation',
      position: 2,
    });
  });

  it('computes totalWeeks, totalHours, and averageHoursPerWeek', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(3);
    });

    // Regular Week: 40 hrs * 48 wks = 1920 total hours
    expect(result.current.totalWeeks).toBe(48);
    expect(result.current.totalHours).toBe(1920);
    expect(result.current.averageHoursPerWeek).toBe(40);
  });

  it('computes weeksRemaining as 52 minus totalWeeks', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(3);
    });

    // 52 - 48 = 4 weeks remaining
    expect(result.current.weeksRemaining).toBe(4);
  });

  it('returns 0 for averageHoursPerWeek when totalWeeks is 0', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper({
        id: 'goal-1',
        designationSupportHoursItems: [
          {
            id: 'item-1',
            label: 'Entry',
            hoursPerWeek: 10,
            numberOfWeeks: 0,
            name: 'entry',
            position: 0,
            predefined: false,
          },
        ],
      }),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
    });

    expect(result.current.averageHoursPerWeek).toBe(0);
  });

  it('builds dataWithTotal with a total row appended', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.dataWithTotal).toHaveLength(4);
    });

    const totalRow =
      result.current.dataWithTotal[result.current.dataWithTotal.length - 1];
    expect(totalRow).toMatchObject({
      id: 'total',
      label: 'Total',
      weeks: 48,
      totalHours: 1920,
      canDelete: false,
    });
  });

  it('adds totalHours to each entry in dataWithTotal', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.dataWithTotal).toHaveLength(4);
    });

    // Regular Week: 40 * 48 = 1920
    expect(result.current.dataWithTotal[0]).toMatchObject({
      id: 'item-regular',
      totalHours: 1920,
    });
    // Travel: 0 * 0 = 0
    expect(result.current.dataWithTotal[1]).toMatchObject({
      id: 'item-travel',
      totalHours: 0,
    });
  });

  it('addEntry creates a temporary entry and fires a create mutation', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(3);
    });

    await act(async () => {
      await result.current.addEntry();
    });

    expect(result.current.entries).toHaveLength(4);
    expect(result.current.entries[3]).toMatchObject({
      label: 'New Entry',
      hoursPerWeek: 0,
      weeks: 0,
      canDelete: true,
      predefined: false,
      position: 3,
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'CreateDesignationSupportHoursItem',
        {
          attributes: {
            designationSupportCalculationId: 'goal-1',
            label: 'New Entry',
            hoursPerWeek: 0,
            numberOfWeeks: 0,
            position: 3,
          },
        },
      ),
    );
  });

  it('deleteEntry removes the entry and fires a delete mutation', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(3);
    });

    // Add a custom entry first, then delete it
    await act(async () => {
      await result.current.addEntry();
    });

    expect(result.current.entries).toHaveLength(4);
    const newEntryId = result.current.entries[3].id;

    await act(async () => {
      await result.current.deleteEntry(newEntryId);
    });

    expect(result.current.entries).toHaveLength(3);
  });

  it('deleteEntry autosaves the recalculated average', async () => {
    const fullMock: PdsGoalCalculationMock = {
      id: 'goal-1',
      designationSupportHoursItems: [
        {
          id: 'item-a',
          label: 'A',
          hoursPerWeek: 40,
          numberOfWeeks: 26,
          name: 'a',
          position: 0,
          predefined: false,
        },
        {
          id: 'item-b',
          label: 'B',
          hoursPerWeek: 20,
          numberOfWeeks: 26,
          name: 'b',
          position: 1,
          predefined: false,
        },
      ],
    };

    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(fullMock),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
    });

    // Average before delete: (40*26 + 20*26) / 52 = 30
    expect(result.current.averageHoursPerWeek).toBe(30);

    await act(async () => {
      await result.current.deleteEntry('item-b');
    });

    // After deleting B: average = (40*26) / 26 = 40
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          averageHoursPerWeek: 40,
        },
      }),
    );
  });

  it('processRowUpdate clamps weeks to not exceed 52 total', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(3);
    });

    // Regular has 48 weeks. Try to set Travel to 10 weeks — should clamp to 4
    let updatedRow: GridValidRowModel | undefined;
    await act(async () => {
      updatedRow = await result.current.processRowUpdate({
        id: 'item-travel',
        label: 'Travel',
        hoursPerWeek: 5,
        weeks: 10,
        canDelete: true,
        predefined: true,
        position: 1,
      });
    });

    expect(updatedRow?.weeks).toBe(4);
  });

  it('processRowUpdate autosaves the recalculated average', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(3);
    });

    await act(async () => {
      await result.current.processRowUpdate({
        id: 'item-regular',
        label: 'Regular Week',
        hoursPerWeek: 20,
        weeks: 48,
        canDelete: false,
        predefined: true,
        position: 0,
      });
    });

    // Average = 20 * 48 / 48 = 20
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          averageHoursPerWeek: 20,
        },
      }),
    );
  });

  it('processRowUpdate skips mutation for the total row', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(3);
    });

    let returned: GridValidRowModel | undefined;
    await act(async () => {
      returned = await result.current.processRowUpdate({
        id: 'total',
        label: 'Total',
        hoursPerWeek: null,
        weeks: 48,
      });
    });

    expect(returned).toMatchObject({ id: 'total' });
  });

  it('sets predefined entries as non-deletable', async () => {
    const { result } = renderHook(useHoursPerWeekGrid, {
      wrapper: createWrapper(),
    });

    await waitForDataToLoad();

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(3);
    });

    // All default entries are predefined
    result.current.entries.forEach((entry) => {
      expect(entry.canDelete).toBe(false);
      expect(entry.predefined).toBe(true);
    });
  });
});
