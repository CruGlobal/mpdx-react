import React, { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  SimplePrintOnly,
  SimpleScreenOnly,
} from 'src/components/Reports/styledComponents';
import { useMpdGoalRows } from 'src/hooks/useMpdGoalRows';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { safeProgressRatio } from '../../../Shared/helpers/safeProgressRatio';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { MpdGoalHeaderCards } from './MpdGoalHeaderCards/MpdGoalHeaderCards';
import { MpdGoalPrintTable } from './MpdGoalPrintTable/MpdGoalPrintTable';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
  },
  '.MuiDataGrid-row.bold': {
    fontWeight: 'bold',
  },
  '.MuiDataGrid-row.top-border': {
    borderTop: '3px solid black',
  },
  '.MuiDataGrid-cell.indent': {
    paddingLeft: theme.spacing(4),
  },
  '.MuiDataGrid-columnHeader.reference, .MuiDataGrid-cell.reference': {
    backgroundColor: theme.palette.mpdxBlue.light,
  },
}));

interface MpdGoalTableProps {
  supportRaised: number;
}

export const MpdGoalTable: React.FC<MpdGoalTableProps> = ({
  supportRaised,
}) => {
  const { t } = useTranslation();
  const localeText = useDataGridLocaleText();
  const { goalTotals } = useGoalCalculator();
  const { rows, valueFormatter } = useMpdGoalRows(supportRaised);

  const columns = useMemo(
    (): GridColDef[] => [
      {
        field: 'line',
        headerName: t('Line'),
        width: 80,
        sortable: false,
        hideable: false,
      },
      {
        field: 'category',
        headerName: t('Category'),
        flex: 1,
        minWidth: 200,
        sortable: false,
        hideable: false,
      },
      {
        field: 'reference',
        headerName: t('NS Reference'),
        headerClassName: 'reference',
        width: 130,
        sortable: false,
        hideable: true,
        valueFormatter,
      },
      {
        field: 'amount',
        headerName: t('Amount'),
        width: 120,
        sortable: false,
        hideable: false,
        valueFormatter,
      },
    ],
    [t, valueFormatter],
  );

  return (
    <>
      <MpdGoalHeaderCards
        supportRaisedPercentage={safeProgressRatio(
          supportRaised,
          goalTotals.overallTotal,
        )}
      />
      <SimpleScreenOnly>
        <StyledDataGrid
          label={t('MPD Goal')}
          getRowId={(row) => row.line}
          getRowClassName={(params) => {
            const classes: string[] = [];

            // Bold subtotal and total lines
            if (
              params.row.line === '1J' ||
              params.row.line === '6' ||
              params.row.line === '8'
            ) {
              classes.push('bold');
            }

            // Add a top border to some lines
            if (params.row.line === '1' || params.row.line === '6') {
              classes.push('top-border');
            }

            return classes.join(' ');
          }}
          getCellClassName={(params) => {
            const classes: string[] = [];

            // Indent categories belonging to lines that contain a letter
            if (
              params.colDef.field === 'category' &&
              typeof params.row.line === 'string' &&
              /[a-z]/i.test(params.row.line)
            ) {
              classes.push('indent');
            }

            // Identify reference cells
            if (params.colDef.field === 'reference') {
              classes.push(params.colDef.field);
            }

            return classes.join(' ');
          }}
          rows={rows}
          columns={columns}
          disableColumnFilter
          disableColumnMenu
          disableRowSelectionOnClick
          disableVirtualization
          hideFooter
          autoHeight
          localeText={localeText}
        />
      </SimpleScreenOnly>
      <SimplePrintOnly>
        <MpdGoalPrintTable supportRaised={supportRaised} />
      </SimplePrintOnly>
    </>
  );
};
