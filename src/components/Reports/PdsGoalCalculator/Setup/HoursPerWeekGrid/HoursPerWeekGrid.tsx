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
import { StyledGrid } from 'src/components/Reports/GoalCalculator/SharedComponents/GoalCalculatorGrid/StyledGrid';

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
}

interface HoursPerWeekGridProps {
  onAverageHoursChange?: (averageHoursPerWeek: number) => void;
}

export const HoursPerWeekGrid: React.FC<HoursPerWeekGridProps> = ({
  onAverageHoursChange,
}) => {
  const { t } = useTranslation();
  const defaultEntries = useMemo<HoursPerWeekEntry[]>(
    () => [
      {
        id: 'default-regular',
        label: t('Regular Week'),
        hoursPerWeek: 40,
        weeks: 48,
        canDelete: false,
      },
      {
        id: 'default-travel',
        label: t('Travel'),
        hoursPerWeek: 0,
        weeks: 0,
        canDelete: false,
      },
      {
        id: 'default-vacation',
        label: t('Unpaid Vacation'),
        hoursPerWeek: 0,
        weeks: 0,
        canDelete: false,
      },
    ],
    [t],
  );
  const [entries, setEntries] = useState<HoursPerWeekEntry[]>(defaultEntries);
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

  const updateEntry = useCallback(
    (id: string, updates: Partial<HoursPerWeekEntry>) => {
      setEntries((prev) => {
        const updated = prev.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry,
        );

        // Notify parent of new average
        const newTotalWeeks = updated.reduce((sum, e) => sum + e.weeks, 0);
        const newTotalHours = updated.reduce(
          (sum, e) => sum + e.hoursPerWeek * e.weeks,
          0,
        );
        const newAverage =
          newTotalWeeks > 0 ? newTotalHours / newTotalWeeks : 0;
        onAverageHoursChange?.(newAverage);

        return updated;
      });
    },
    [onAverageHoursChange],
  );

  const addEntry = useCallback(() => {
    const newEntry: HoursPerWeekEntry = {
      id: `custom-${nextEntryIdRef.current++}`,
      label: t('New Entry'),
      hoursPerWeek: 0,
      weeks: 0,
      canDelete: true,
    };
    setEntries((prev) => [...prev, newEntry]);
  }, [t]);

  const deleteEntry = useCallback((id: string | number) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id.toString()));
  }, []);

  const processRowUpdate = useCallback(
    (newRow: GridValidRowModel) => {
      if (newRow.id === 'total') {
        return newRow;
      }

      updateEntry(newRow.id as string, {
        label: newRow.label as string,
        hoursPerWeek: Number(newRow.hoursPerWeek) || 0,
        weeks: Number(newRow.weeks) || 0,
      });

      return newRow;
    },
    [updateEntry],
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

        <StyledGrid
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
    </Box>
  );
};
