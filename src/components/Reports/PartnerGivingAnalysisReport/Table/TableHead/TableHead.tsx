import React, { FC } from 'react';
import { Checkbox, TableCell, TableHead, TableRow } from '@material-ui/core';
// import { PartnerGivingAnalysisReportQuery } from '../../../GetPartnerGivingAnalysisReport.generated';
import type { Order } from '../../../Reports.type';
import type { Contact } from '../../PartnerGivingAnalysisReport';
import { TableHeadCell } from './TableHeadCell/TableHeadCell';

export type Item = {
  id: keyof Contact;
  label: string;
};

export interface PartnerGivingAnalysisReportTableHeadProps {
  isSelectedAll: boolean;
  isSelectedSome: boolean;
  items: Item[];
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Contact,
  ) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string | null;
}

export const PartnerGivingAnalysisReportTableHead: FC<PartnerGivingAnalysisReportTableHeadProps> = ({
  isSelectedAll,
  isSelectedSome,
  items,
  order,
  orderBy,
  onRequestSort,
  onSelectAll,
}) => {
  const createSortHandler = (property: keyof Contact) => (
    event: React.MouseEvent<unknown>,
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead data-testid="PartnerGivingAnalysisReportTableHead">
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelectedAll}
            indeterminate={isSelectedSome}
            onChange={onSelectAll}
          />
        </TableCell>
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
