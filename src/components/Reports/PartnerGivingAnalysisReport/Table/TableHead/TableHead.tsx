import React, { FC } from 'react';
import { Checkbox, TableCell, TableHead, TableRow } from '@material-ui/core';
// import { PartnerGivingAnalysisReportQuery } from '../../../GetPartnerGivingAnalysisReport.generated';
import type { Order } from '../../../Reports.type';
import { TableHeadCell } from './TableHeadCell/TableHeadCell';

export interface PartnerGivingAnalysisReportTableHeadProps {
  items: Array<Record<string, unknown>>;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string | null;
}

export const PartnerGivingAnalysisReportTableHead: FC<PartnerGivingAnalysisReportTableHeadProps> = ({
  items,
  order,
  orderBy,
  onRequestSort,
}) => {
  const createSortHandler = (property: string) => (
    event: React.MouseEvent<unknown>,
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead data-testid="PartnerGivingAnalysisReportTableHead">
      <TableRow>
        {items.map((item) => (
          <TableHeadCell
            key={item.id}
            align="center"
            isActive={orderBy === item.id}
            sortDirection={orderBy === item.id ? order : false}
            direction={orderBy === item.id ? order : 'asc'}
            onClick={createSortHandler(item.id)}
          >
            {item.label}
          </TableHeadCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
