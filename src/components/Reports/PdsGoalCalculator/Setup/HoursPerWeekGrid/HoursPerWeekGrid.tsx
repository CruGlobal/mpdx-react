import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import {
  Box,
  Button,
  Card,
  Divider,
  FormHelperText,
  Typography,
  styled,
} from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { BaseGrid } from 'src/components/Reports/GoalCalculator/SharedComponents/GoalCalculatorGrid/BaseGrid';
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

const ErrorCell = styled(Box)(({ theme }) => ({
  height: '100%',
  border: `2px solid ${theme.palette.error.main}`,
}));

// TODO(MPDX-XXXX): Replace HoursPerWeekCategory and seeded defaults with
// values from a REST-proxy GraphQL query once the back-end endpoint exists.
// Mirror the pages/api/Schema/<Feature>/ pattern used by SubBudgetCategory.
// Seeded rows (non-null category) must not be deletable, matching the
// SubBudgetCategoryEnum convention in GoalCalculatorGrid. The category
// literals below are placeholders — the server-generated enum will replace
// them and likely use different casing.
export type HoursPerWeekCategory =
  | 'regularWeek'
  | 'travel'
  | 'unpaidVacation'
  | null;

export interface HoursPerWeekEntry {
  id: string;
  label: string;
  hoursPerWeek: number;
  weeks: number;
  category: HoursPerWeekCategory;
}

// Module-level counter so custom-entry ids don't collide across remounts of
// the panel (the parent unmounts this when closing the right panel).
let nextCustomEntryId = 0;

interface HoursPerWeekGridProps {
  onAverageHoursChange?: (averageHoursPerWeek: number) => void;
}

export const HoursPerWeekGrid: React.FC<HoursPerWeekGridProps> = ({
  onAverageHoursChange,
}) => {
  const { t } = useTranslation();
  const { trackMutation } = usePdsGoalCalculator();
  // TODO(MPDX-XXXX): These should come from the server as seeded rows on the
  // HoursPerWeek query, analogous to how PrimaryBudgetCategory.subBudgetCategories
  // returns rows with a non-null `category` enum. Labels are initialized
  // once from translations — we don't reactively relabel on language change
  // because once the server owns these rows, labels will come from the API.
  const [entries, setEntries] = useState<HoursPerWeekEntry[]>(() => [
    {
      id: 'default-regular',
      label: t('Regular Week'),
      hoursPerWeek: 40,
      weeks: 48,
      category: 'regularWeek',
    },
    {
      id: 'default-travel',
      label: t('Travel'),
      hoursPerWeek: 0,
      weeks: 0,
      category: 'travel',
    },
    {
      id: 'default-vacation',
      label: t('Unpaid Vacation'),
      hoursPerWeek: 0,
      weeks: 0,
      category: 'unpaidVacation',
    },
  ]);

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

  // Notify the parent whenever the average changes, regardless of whether
  // the change came from an edit, add, or delete.
  useEffect(() => {
    onAverageHoursChange?.(averageHoursPerWeek);
  }, [averageHoursPerWeek, onAverageHoursChange]);

  // TODO(MPDX-XXXX): Replace with useUpdateHoursPerWeekEntryMutation. The
  // Promise.resolve placeholder keeps the trackMutation scaffolding in place
  // so the autosave indicator / unsaved-changes guard already works.
  const updateEntry = useCallback(
    (id: string, updates: Partial<HoursPerWeekEntry>) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry,
        ),
      );
      trackMutation(Promise.resolve());
    },
    [trackMutation],
  );

  // TODO(MPDX-XXXX): Replace with useCreateHoursPerWeekEntryMutation +
  // optimistic response / cache update, following the createSubBudgetCategory
  // pattern in GoalCalculatorGrid.
  const addEntry = useCallback(() => {
    const newEntry: HoursPerWeekEntry = {
      id: `custom-${nextCustomEntryId++}`,
      label: t('New Entry'),
      hoursPerWeek: 0,
      weeks: 0,
      category: null,
    };
    setEntries((prev) => [...prev, newEntry]);
    trackMutation(Promise.resolve());
  }, [t, trackMutation]);

  // TODO(MPDX-XXXX): Replace with useDeleteHoursPerWeekEntryMutation +
  // cache update, following the deleteSubBudgetCategory pattern.
  const deleteEntry = useCallback(
    (id: string | number) => {
      setEntries((prev) => prev.filter((entry) => entry.id !== id.toString()));
      trackMutation(Promise.resolve());
    },
    [trackMutation],
  );

  const entrySchema = useMemo(
    () =>
      yup.object({
        label: yup
          .string()
          .trim()
          .min(1, t('Label is required'))
          .max(100, t('Label must be less than 100 characters'))
          .required(t('Label is required')),
        hoursPerWeek: yup
          .number()
          .min(0, t('Hours must be positive'))
          .required(t('Hours is required')),
        weeks: yup
          .number()
          .min(0, t('Weeks must be positive'))
          .required(t('Weeks is required')),
      }),
    [t],
  );

  const [cellErrors, setCellErrors] = useState<
    Record<string, string | undefined>
  >({});

  // TODO(MPDX-XXXX): Replace with useUpdateHoursPerWeekEntryMutation +
  // optimistic response, following the updateSubBudgetCategory pattern.
  const processRowUpdate = useCallback(
    (newRow: GridValidRowModel, oldRow: GridValidRowModel) => {
      if (newRow.id === 'total') {
        return newRow;
      }

      const rowId = newRow.id as string;
      const label = newRow.label as string;
      const hoursPerWeek = Number(newRow.hoursPerWeek) || 0;
      const weeks = Number(newRow.weeks) || 0;

      try {
        entrySchema.validateSync(
          { label, hoursPerWeek, weeks },
          { abortEarly: false },
        );
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          setCellErrors((prev) => {
            const updated = { ...prev };
            error.inner.forEach((innerError) => {
              if (innerError.path) {
                updated[`${rowId}-${innerError.path}`] = innerError.message;
              }
            });
            return updated;
          });
        }
        // Revert the grid cell to the prior value so the UI doesn't drift
        // from our source-of-truth `entries` state.
        return oldRow;
      }

      setCellErrors((prev) => {
        const updated = { ...prev };
        delete updated[`${rowId}-label`];
        delete updated[`${rowId}-hoursPerWeek`];
        delete updated[`${rowId}-weeks`];
        return updated;
      });

      updateEntry(rowId, { label, hoursPerWeek, weeks });

      return newRow;
    },
    [entrySchema, updateEntry],
  );

  const renderNumberCell = useCallback(
    (field: 'hoursPerWeek' | 'weeks') =>
      function NumberCell(params: GridRenderCellParams) {
        const cellKey = `${params.id}-${field}`;
        const hasError = cellErrors[cellKey];
        const display =
          typeof params.value === 'number'
            ? params.formattedValue ?? params.value
            : '';

        if (hasError) {
          return <ErrorCell title={hasError}>{String(display)}</ErrorCell>;
        }

        return display;
      },
    [cellErrors],
  );

  const dataWithTotal = useMemo(
    () => [
      ...entries.map((entry) => ({
        ...entry,
        canDelete: entry.category === null,
        totalHours: entry.hoursPerWeek * entry.weeks,
      })),
      {
        id: 'total',
        label: t('Total'),
        hoursPerWeek: null,
        weeks: totalWeeks,
        totalHours: totalHours,
        canDelete: false,
        category: null,
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
        renderCell: renderNumberCell('hoursPerWeek'),
      },
      {
        field: 'weeks',
        headerName: t('# Weeks'),
        width: 100,
        editable: true,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        renderCell: renderNumberCell('weeks'),
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
          if (params.id === 'total') {
            return [];
          }

          if (!params.row.canDelete) {
            return [
              <GridActionsCellItem
                key="forbidden"
                icon={<DoNotDisturbAltIcon />}
                label="forbidden"
                disabled
                showInMenu={false}
              />,
            ];
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
    [t, totalHours, deleteEntry, renderNumberCell],
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('Hours Per Week Calculator')}
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

      {Object.entries(cellErrors).map(([cellKey, error]) => {
        if (!error) {
          return null;
        }
        const rowId = cellKey.split('-').slice(0, -1).join('-');
        const rowLabel =
          entries.find((entry) => entry.id === rowId)?.label ?? '';
        return (
          <FormHelperText key={cellKey} error sx={{ mb: 0.5 }}>
            {rowLabel ? `${rowLabel}: ${error}` : error}
          </FormHelperText>
        );
      })}
    </Box>
  );
};
