import React, { useMemo } from 'react';
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
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { BaseGrid } from 'src/components/Reports/GoalCalculator/SharedComponents/GoalCalculatorGrid/BaseGrid';
import { useHoursPerWeekGrid } from './useHoursPerWeekGrid';

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

interface HoursPerWeekGridProps {
  onApply?: (averageHoursPerWeek: number) => void;
}

export const HoursPerWeekGrid: React.FC<HoursPerWeekGridProps> = ({
  onApply,
}) => {
  const { t } = useTranslation();
  const {
    totalHours,
    averageHoursPerWeek,
    weeksRemaining,
    dataWithTotal,
    addEntry,
    deleteEntry,
    processRowUpdate,
  } = useHoursPerWeekGrid();

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
            max: 52,
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
