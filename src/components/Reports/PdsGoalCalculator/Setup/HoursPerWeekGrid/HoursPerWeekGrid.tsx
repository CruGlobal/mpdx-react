import React, { useCallback, useMemo, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Card, Divider, Typography, styled } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { BaseGrid } from 'src/components/Reports/GoalCalculator/SharedComponents/GoalCalculatorGrid/BaseGrid';
import {
  useCreateDesignationSupportHoursItemMutation,
  useUpdateDesignationSupportHoursItemMutation,
} from '../../GoalsList/PdsGoalCalculations.generated';
import { useSaveField } from '../../Shared/Autosave/useSaveField';
import { usePdsGoalCalculator } from '../../Shared/PdsGoalCalculatorContext';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingTop: theme.spacing(2),
}));

const FooterRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  fontWeight: 'bold',
}));

export interface HoursPerWeekEntry {
  id: string;
  label: string;
  hoursPerWeek: number;
  weeks: number;
  canDelete: boolean;
  predefined: boolean;
}

interface HoursPerWeekGridProps {
  onApply?: (averageHoursPerWeek: number) => void;
}

const MAX_TOTAL_WEEKS = 52;

export const HoursPerWeekGrid: React.FC<HoursPerWeekGridProps> = ({
  onApply,
}) => {
  const { t } = useTranslation();
  const { calculation, trackMutation } = usePdsGoalCalculator();
  const [createHoursItem] = useCreateDesignationSupportHoursItemMutation();
  const [updateHoursItem] = useUpdateDesignationSupportHoursItemMutation();
  const saveField = useSaveField();

  const [entries, setEntries] = useState<HoursPerWeekEntry[]>(() => {
    const items = calculation?.designationSupportHoursItems;
    if (items && items.length > 0) {
      return items
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((item) => ({
          id: item.id,
          label: item.label,
          hoursPerWeek: item.hoursPerWeek ?? 0,
          weeks: item.numberOfWeeks ?? 0,
          canDelete: !item.predefined,
          predefined: item.predefined,
        }));
    }
    return [
      {
        id: 'default-regular',
        label: t('Regular Week'),
        hoursPerWeek: 40,
        weeks: 48,
        canDelete: false,
        predefined: true,
      },
      {
        id: 'default-travel',
        label: t('Travel'),
        hoursPerWeek: 0,
        weeks: 0,
        canDelete: false,
        predefined: true,
      },
      {
        id: 'default-vacation',
        label: t('Unpaid Vacation'),
        hoursPerWeek: 0,
        weeks: 0,
        canDelete: false,
        predefined: true,
      },
    ];
  });
  const nextEntryIdRef = useRef(0);

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

  const saveHoursItem = useCallback(
    async (entry: HoursPerWeekEntry, currentEntries: HoursPerWeekEntry[]) => {
      if (!calculation) {
        return;
      }

      if (entry.id.startsWith('temp-') || entry.id.startsWith('default-')) {
        const result = await trackMutation(
          createHoursItem({
            variables: {
              attributes: {
                designationSupportCalculationId: calculation.id,
                label: entry.label,
                hoursPerWeek: entry.hoursPerWeek,
                numberOfWeeks: entry.weeks,
                position: currentEntries.indexOf(entry),
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
            prev.map((e) => (e.id === entry.id ? { ...e, id: created.id } : e)),
          );
        }
      } else {
        await trackMutation(
          updateHoursItem({
            variables: {
              attributes: {
                id: entry.id,
                designationSupportCalculationId: calculation.id,
                label: entry.label,
                hoursPerWeek: entry.hoursPerWeek,
                numberOfWeeks: entry.weeks,
                position: currentEntries.indexOf(entry),
              },
            },
            refetchQueries: ['PdsGoalCalculation'],
          }),
        );
      }
    },
    [calculation, createHoursItem, updateHoursItem, trackMutation],
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
    const newEntry: HoursPerWeekEntry = {
      id: tempId,
      label: t('New Entry'),
      hoursPerWeek: 0,
      weeks: 0,
      canDelete: true,
      predefined: false,
    };
    setEntries((prev) => [...prev, newEntry]);

    const result = await trackMutation(
      createHoursItem({
        variables: {
          attributes: {
            designationSupportCalculationId: calculation.id,
            label: t('New Entry'),
            hoursPerWeek: 0,
            numberOfWeeks: 0,
            position: entries.length,
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
  }, [t, calculation, createHoursItem, trackMutation, entries.length]);

  const deleteEntry = useCallback((id: string | number) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id.toString()));
  }, []);

  const processRowUpdate = useCallback(
    (newRow: GridValidRowModel) => {
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
      };

      updateEntry(newRow.id as string, {
        label: updatedEntry.label,
        hoursPerWeek: updatedEntry.hoursPerWeek,
        weeks: updatedEntry.weeks,
      });

      saveHoursItem(updatedEntry, entries);

      // Autosave the recalculated average to the calculation
      const updatedEntries = entries.map((e) =>
        e.id === updatedEntry.id ? updatedEntry : e,
      );
      const newTotalWeeks = updatedEntries.reduce(
        (sum, e) => sum + e.weeks,
        0,
      );
      const newTotalHours = updatedEntries.reduce(
        (sum, e) => sum + e.hoursPerWeek * e.weeks,
        0,
      );
      const newAverage =
        newTotalWeeks > 0 ? newTotalHours / newTotalWeeks : 0;
      saveField({
        averageHoursPerWeek: Math.round(newAverage * 10) / 10,
      });

      return { ...newRow, weeks: Math.max(0, clampedWeeks) };
    },
    [updateEntry, entries, saveHoursItem, saveField],
  );

  const dataWithTotal = useMemo(
    () => [
      ...entries.map((entry) => ({
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

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'label',
        headerName: t('Activity'),
        flex: 1,
        minWidth: 120,
        editable: true,
      },
      {
        field: 'hoursPerWeek',
        headerName: t('Hrs/Week'),
        width: 100,
        editable: true,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'weeks',
        headerName: t('# Weeks'),
        width: 100,
        editable: true,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'totalHours',
        headerName: t('Total Hrs'),
        width: 100,
        editable: false,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_value, row) => {
          if (row.id === 'total') {
            return totalHours;
          }
          return (row.hoursPerWeek ?? 0) * (row.weeks ?? 0);
        },
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: '',
        width: 60,
        getActions: (params) => {
          if (params.id === 'total' || !params.row.canDelete) {
            return [];
          }

          return [
            <GridActionsCellItem
              key="delete"
              icon={<DeleteIcon />}
              label={t('Delete')}
              onClick={() => deleteEntry(params.id)}
              showInMenu={false}
            />,
          ];
        },
      },
    ],
    [t, totalHours, deleteEntry],
  );

  return (
    <Box>
      <Typography variant="h6">{t('Hours Per Week Calculator')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('Weeks are limited to 52 total to reflect a full calendar year.')}
      </Typography>

      <StyledCard>
        <Button
          variant="text"
          onClick={addEntry}
          size="small"
          startIcon={<AddIcon />}
        >
          {t('Add Entry')}
        </Button>

        <BaseGrid
          rows={dataWithTotal}
          columns={columns}
          processRowUpdate={processRowUpdate}
          onCellEditStart={(_, event) => {
            requestAnimationFrame(() => {
              const input =
                event.target instanceof HTMLElement &&
                event.target.querySelector('input');
              if (!input) {
                return;
              }

              input.type = 'text';
              input.setSelectionRange(0, input.value.length);
              input.type = 'number';
            });
          }}
          isCellEditable={(params) => {
            if (params.id === 'total') {
              return false;
            }
            if (params.field === 'label' && !params.row.canDelete) {
              return false;
            }
            return true;
          }}
        />

        <Divider />
        <FooterRow>
          <Typography variant="body2" fontWeight="bold">
            {t('Average Hours Worked Per Week')}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {averageHoursPerWeek.toFixed(1)}
          </Typography>
        </FooterRow>
      </StyledCard>

      {onApply && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={() =>
              onApply(Math.round(averageHoursPerWeek * 10) / 10)
            }
          >
            {t('Apply to Hours Worked')}
          </Button>
        </Box>
      )}
    </Box>
  );
};
