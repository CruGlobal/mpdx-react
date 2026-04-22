import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  useCreateDesignationSupportHoursItemMutation,
  useDeleteDesignationSupportHoursItemMutation,
  useUpdateDesignationSupportHoursItemMutation,
} from '../../GoalsList/PdsGoalCalculations.generated';
import { useSaveField } from '../../Shared/Autosave/useSaveField';
import { usePdsGoalCalculator } from '../../Shared/PdsGoalCalculatorContext';

export interface HoursPerWeekEntry {
  id: string;
  label: string;
  hoursPerWeek: number;
  weeks: number;
  canDelete: boolean;
  predefined: boolean;
  position: number;
}

const MAX_TOTAL_WEEKS = 52;

export const useHoursPerWeekGrid = () => {
  const { t } = useTranslation();
  const { calculation, trackMutation } = usePdsGoalCalculator();
  const [createHoursItem] = useCreateDesignationSupportHoursItemMutation();
  const [updateHoursItem] = useUpdateDesignationSupportHoursItemMutation();
  const [deleteHoursItem] = useDeleteDesignationSupportHoursItemMutation();
  const saveField = useSaveField();

  const [entries, setEntries] = useState<HoursPerWeekEntry[]>([]);
  const initializedRef = useRef(false);
  const nextEntryIdRef = useRef(0);

  useEffect(() => {
    const items = calculation?.designationSupportHoursItems;
    if (!initializedRef.current && items && items.length > 0) {
      initializedRef.current = true;
      setEntries(
        items
          .slice()
          .sort(
            (hoursItemA, hoursItemB) =>
              (hoursItemA.position ?? 0) - (hoursItemB.position ?? 0),
          )
          .map((item) => ({
            id: item.id,
            label: item.label,
            hoursPerWeek: item.hoursPerWeek ?? 0,
            weeks: item.numberOfWeeks ?? 0,
            canDelete: !item.predefined,
            predefined: item.predefined,
            position: item.position ?? 0,
          })),
      );
    }
  }, [calculation?.designationSupportHoursItems]);

  const totalWeeks = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.weeks, 0),
    [entries],
  );

  const totalHours = useMemo(
    () =>
      entries.reduce((sum, entry) => sum + entry.hoursPerWeek * entry.weeks, 0),
    [entries],
  );

  const averageHoursPerWeek = useMemo(
    () => (totalWeeks > 0 ? totalHours / totalWeeks : 0),
    [totalHours, totalWeeks],
  );

  const weeksRemaining = MAX_TOTAL_WEEKS - totalWeeks;

  const saveHoursItem = useCallback(
    async (entry: HoursPerWeekEntry) => {
      if (!calculation) {
        return;
      }

      try {
        await trackMutation(
          updateHoursItem({
            variables: {
              attributes: {
                id: entry.id,
                designationSupportCalculationId: calculation.id,
                label: entry.label,
                hoursPerWeek: entry.hoursPerWeek,
                numberOfWeeks: entry.weeks,
              },
            },
            refetchQueries: ['PdsGoalCalculation'],
          }),
        );
      } catch {
        throw new Error(t('Failed to save hours entry.'));
      }
    },
    [calculation, createHoursItem, updateHoursItem, trackMutation, t],
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<HoursPerWeekEntry>) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry,
        ),
      );
    },
    [],
  );

  const addEntry = useCallback(async () => {
    if (!calculation) {
      return;
    }

    const tempId = `temp-${nextEntryIdRef.current++}`;
    const newPosition =
      entries.length > 0 ? Math.max(...entries.map((e) => e.position)) + 1 : 0;
    const newEntry: HoursPerWeekEntry = {
      id: tempId,
      label: t('New Entry'),
      hoursPerWeek: 0,
      weeks: 0,
      canDelete: true,
      predefined: false,
      position: newPosition,
    };
    setEntries((prev) => [...prev, newEntry]);

    try {
      const result = await trackMutation(
        createHoursItem({
          variables: {
            attributes: {
              designationSupportCalculationId: calculation.id,
              label: t('New Entry'),
              hoursPerWeek: 0,
              numberOfWeeks: 0,
              position: newPosition,
            },
          },
          refetchQueries: ['PdsGoalCalculation'],
        }),
      );
      const created =
        result.data?.createDesignationSupportHoursItem
          ?.designationSupportHoursItem;
      if (created) {
        setEntries((prev) =>
          prev.map((e) => (e.id === tempId ? { ...e, id: created.id } : e)),
        );
      }
    } catch {
      setEntries((prev) => prev.filter((e) => e.id !== tempId));
    }
  }, [t, calculation, createHoursItem, trackMutation, entries.length]);

  const deleteEntry = useCallback(
    async (id: string | number) => {
      const entryId = id.toString();
      const previousEntries = entries;
      const remainingEntries = entries.filter((entry) => entry.id !== entryId);
      setEntries(remainingEntries);

      const newTotalWeeks = remainingEntries.reduce(
        (sum, e) => sum + e.weeks,
        0,
      );
      const newTotalHours = remainingEntries.reduce(
        (sum, e) => sum + e.hoursPerWeek * e.weeks,
        0,
      );
      const newAverage = newTotalWeeks > 0 ? newTotalHours / newTotalWeeks : 0;

      try {
        if (!entryId.startsWith('temp-') && !entryId.startsWith('default-')) {
          await trackMutation(
            deleteHoursItem({
              variables: { id: entryId },
              refetchQueries: ['PdsGoalCalculation'],
            }),
          );
        }
        saveField({
          averageHoursPerWeek: newAverage,
        });
      } catch {
        setEntries(previousEntries);
      }
    },
    [entries, deleteHoursItem, trackMutation, saveField],
  );

  const processRowUpdate = useCallback(
    async (newRow: GridValidRowModel) => {
      if (newRow.id === 'total') {
        return newRow;
      }

      const newWeeks = Number(newRow.weeks) || 0;
      const otherWeeks = entries
        .filter((e) => e.id !== newRow.id)
        .reduce((sum, e) => sum + e.weeks, 0);
      const clampedWeeks = Math.min(newWeeks, MAX_TOTAL_WEEKS - otherWeeks);

      const updatedEntry: HoursPerWeekEntry = {
        id: newRow.id as string,
        label: newRow.label as string,
        hoursPerWeek: Number(newRow.hoursPerWeek) || 0,
        weeks: Math.max(0, clampedWeeks),
        canDelete: newRow.canDelete as boolean,
        predefined: newRow.predefined as boolean,
        position: Number(newRow.position) || 0,
      };

      updateEntry(newRow.id as string, {
        label: updatedEntry.label,
        hoursPerWeek: updatedEntry.hoursPerWeek,
        weeks: updatedEntry.weeks,
      });

      await saveHoursItem(updatedEntry);

      const updatedEntries = entries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry,
      );
      const newTotalWeeks = updatedEntries.reduce((sum, e) => sum + e.weeks, 0);
      const newTotalHours = updatedEntries.reduce(
        (sum, e) => sum + e.hoursPerWeek * e.weeks,
        0,
      );
      const newAverage = newTotalWeeks > 0 ? newTotalHours / newTotalWeeks : 0;
      saveField({
        averageHoursPerWeek: newAverage,
      });

      return { ...newRow, weeks: Math.max(0, clampedWeeks) };
    },
    [updateEntry, entries, saveHoursItem, saveField],
  );

  const dataWithTotal = useMemo(
    () => [
      ...entries
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((entry) => ({
          ...entry,
          totalHours: entry.hoursPerWeek * entry.weeks,
        })),
      {
        id: 'total',
        label: t('Total'),
        hoursPerWeek: null,
        weeks: totalWeeks,
        totalHours: totalHours,
        canDelete: false,
      },
    ],
    [entries, totalWeeks, totalHours, t],
  );

  return {
    entries,
    totalWeeks,
    totalHours,
    averageHoursPerWeek,
    weeksRemaining,
    dataWithTotal,
    addEntry,
    deleteEntry,
    processRowUpdate,
  };
};
