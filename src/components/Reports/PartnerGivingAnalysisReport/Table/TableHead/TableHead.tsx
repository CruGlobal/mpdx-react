import React, { FC } from 'react';
import { TableCell, TableHead, TableRow } from '@mui/material';
import type { Order } from '../../../Reports.type';
import type { Contact } from '../../PartnerGivingAnalysisReport';
import { TableHeadCell } from './TableHeadCell/TableHeadCell';

export type Item = {
  id: keyof Contact;
  label: string;
};

export interface PartnerGivingAnalysisReportTableHeadProps {
  items: Item[];
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Contact,
  ) => void;
  order: Order;
  orderBy: string | null;
}

export const PartnerGivingAnalysisReportTableHead: FC<
  PartnerGivingAnalysisReportTableHeadProps
> = ({ items, order, orderBy, onRequestSort }) => {
  const createSortHandler =
    (property: keyof Contact) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead data-testid="PartnerGivingAnalysisReportTableHead">
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        {items.map((item) => (
          <TableHeadCell
            key={item.id}
            align="left"
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
