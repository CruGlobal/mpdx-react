import React, { forwardRef, useMemo } from 'react';
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
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { TableVirtuoso, TableVirtuosoProps } from 'react-virtuoso';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import theme from 'src/theme';
import { EmptyTable } from '../../Shared/EmptyTable/EmptyTable';
import { ReminderData, ReminderStatusEnum } from '../mockData';
import { RemindersTableRow } from './RemindersTableRow';

export type RowValues = {
  status: Record<string, ReminderStatusEnum>;
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
  hasNextPage: boolean;
  endCursor: string;
  fetchMore: (args: { variables: { after: string } }) => void;
}

export const RemindersTable: React.FC<RemindersTableProps> = ({
  data,
  hasNextPage,
  endCursor,
  fetchMore,
}) => {
  const { t } = useTranslation();

  const isEmpty = !data.length;

  const initialValues = useMemo(
    () => ({
      status: Object.fromEntries(
        data.map((row) => [
          row.id,
          row.status ?? ReminderStatusEnum.NotReminded,
        ]),
      ),
    }),
    [data],
  );

  return (
    <Formik<RowValues> initialValues={initialValues} onSubmit={() => {}}>
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
        endReached={() =>
          hasNextPage &&
          fetchMore({
            variables: { after: endCursor },
          })
        }
      />
    </Formik>
  );
};
