import React, { useCallback, useMemo, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Typography,
  styled,
} from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { BaseGrid } from 'src/components/Reports/GoalCalculator/SharedComponents/GoalCalculatorGrid/BaseGrid';
import {
  useCreateDesignationSupportHoursItemMutation,
  useDeleteDesignationSupportHoursItemMutation,
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
  position: number;
}

interface HoursPerWeekGridProps {
  onApply?: (averageHoursPerWeek: number) => void;
}

const MAX_TOTAL_WEEKS = 52;

export const HoursPerWeekGrid: React.FC<HoursPerWeekGridProps> = ({
  onApply,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { calculation, trackMutation } = usePdsGoalCalculator();
  const [createHoursItem] = useCreateDesignationSupportHoursItemMutation();
  const [updateHoursItem] = useUpdateDesignationSupportHoursItemMutation();
  const [deleteHoursItem] = useDeleteDesignationSupportHoursItemMutation();
  const saveField = useSaveField();

  const [entries, setEntries] = useState<HoursPerWeekEntry[]>(() => {
    const items = calculation?.designationSupportHoursItems;
    if (items && items.length > 0) {
      return items
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
        }));
    }
    return [];
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

  const weeksRemaining = MAX_TOTAL_WEEKS - totalWeeks;

  const saveHoursItem = useCallback(
    async (entry: HoursPerWeekEntry, currentEntries: HoursPerWeekEntry[]) => {
      if (!calculation) {
        return;
      }

      try {
        if (entry.id.startsWith('default-')) {
          const result = await trackMutation(
            createHoursItem({
              variables: {
                attributes: {
                  designationSupportCalculationId: calculation.id,
                  label: entry.label,
                  hoursPerWeek: entry.hoursPerWeek,
                  numberOfWeeks: entry.weeks,
                  position: currentEntries.findIndex((e) => e.id === entry.id),
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
              prev.map((e) =>
                e.id === entry.id ? { ...e, id: created.id } : e,
              ),
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
                },
              },
              refetchQueries: ['PdsGoalCalculation'],
            }),
          );
        }
      } catch (error) {
        enqueueSnackbar(t('Failed to save hours entry. Please try again.'), {
          variant: 'error',
        });
        throw error;
      }
    },
    [
      calculation,
      createHoursItem,
      updateHoursItem,
      trackMutation,
      enqueueSnackbar,
      t,
    ],
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
      enqueueSnackbar(t('Failed to add entry. Please try again.'), {
        variant: 'error',
      });
    }
  }, [
    t,
    calculation,
    createHoursItem,
    trackMutation,
    entries.length,
    enqueueSnackbar,
  ]);

  const deleteEntry = useCallback(
    async (id: string | number) => {
      const entryId = id.toString();
      const previousEntries = entries;
      const remainingEntries = entries.filter((entry) => entry.id !== entryId);
      setEntries(remainingEntries);

      // Recalculate and autosave the average
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
        enqueueSnackbar(t('Failed to delete entry. Please try again.'), {
          variant: 'error',
        });
      }
    },
    [entries, deleteHoursItem, trackMutation, saveField, enqueueSnackbar, t],
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

      await saveHoursItem(updatedEntry, entries);

      // Autosave the recalculated average to the calculation
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
        {t(
          'This calculator is based on a 52-week year. Weeks are capped at 52 and a warning will appear if the total falls short.',
        )}
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
          onCellEditStart={(params, event) => {
            if (params.field === 'label') {
              return;
            }
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
            if (
              typeof params.id === 'string' &&
              params.id.startsWith('temp-')
            ) {
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

      {weeksRemaining > 0 && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {t('Weeks must add up to {{max}}. {{remaining}} week(s) remaining.', {
            max: MAX_TOTAL_WEEKS,
            remaining: weeksRemaining,
          })}
        </Alert>
      )}

      {onApply && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            disabled={weeksRemaining > 0}
            onClick={() => onApply(averageHoursPerWeek)}
          >
            {t('Apply to Hours Worked')}
          </Button>
        </Box>
      )}
    </Box>
  );
};
