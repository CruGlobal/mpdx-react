import React, { forwardRef } from 'react';
import { HourglassDisabled } from '@mui/icons-material';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TableVirtuoso, TableVirtuosoProps } from 'react-virtuoso';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { EmptyTable } from '../../Shared/EmptyTable/EmptyTable';
import { ReminderData } from '../mockData';
import { RemindersTableRow } from './RemindersTableRow';

export type RowValues = {
  status: Record<string, MinistryPartnerReminderFrequencyEnum>;
};
interface HeaderProps {
  partner: string;
  lastGift: string;
  lastReminder: string;
  status: string;
}

const Scroller = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <TableContainer component={Paper} ref={ref} {...props} />);
Scroller.displayName = 'Scroller';

const Body = forwardRef<HTMLTableSectionElement>((props, ref) => (
  <TableBody {...props} ref={ref} />
));
Body.displayName = 'Body';

const TableComponents: TableVirtuosoProps<HeaderProps, unknown>['components'] =
  {
    Scroller,
    Table: (props) => (
      <Table
        {...props}
        sx={{
          '& .MuiTableCell-root': { borderBottom: 'none' },
          '& .MuiTableCell-head': {
            position: 'sticky',
            top: 0,
            zIndex: (t) => t.zIndex.appBar,
            backgroundColor: 'background.paper',
            boxShadow: (t) => `inset 0 -1px 0 ${t.palette.divider}`,
          },
          tableLayout: 'fixed',
          minWidth: 730,
        }}
      />
    ),
    TableHead,
    TableBody: Body,
    TableRow: (props) => {
      const index = props['data-index'] ?? 0;
      const even = index % 2 === 0;
      return (
        <TableRow
          {...props}
          style={{
            ...props.style,
            backgroundColor: even
              ? theme.palette.chipBlueLight.main
              : 'inherit',
          }}
        />
      );
    },

    EmptyPlaceholder: () => (
      <TableRow>
        <TableCell colSpan={4}>
          <EmptyTable
            title={'No ministry partners to display'}
            subtitle={'Add a ministry partner to get started'}
            icon={HourglassDisabled}
          />
        </TableCell>
      </TableRow>
    ),
  };
interface RemindersTableProps {
  data: ReminderData[];
}

export const RemindersTable: React.FC<RemindersTableProps> = ({ data }) => {
  const { t } = useTranslation();

  const isEmpty = !data.length;

  return (
    <TableVirtuoso
      data={data}
      style={{
        height: isEmpty
          ? 390
          : `calc(100vh - ${navBarHeight} - ${headerHeight} - 62px)`,
        scrollbarWidth: 'none',
      }}
      components={TableComponents}
      fixedHeaderContent={() => (
        <TableRow>
          <TableCell sx={{ width: '35%' }}>{t('Ministry Partner')}</TableCell>
          <TableCell sx={{ width: '20%' }}>{t('Last Gift')}</TableCell>
          <TableCell sx={{ width: '20%' }}>{t('Last Reminder')}</TableCell>
          <TableCell id="status-col" sx={{ width: '25%' }}>
            {t('Reminder Status')}
          </TableCell>
        </TableRow>
      )}
      itemContent={(_, row) => (
        <RemindersTableRow key={row.id} id={row.id} row={row} />
      )}
    />
  );
};
