import React, { ReactNode } from 'react';
import { styled, TableCell, TableSortLabel } from '@material-ui/core';

type Align = 'center' | 'inherit' | 'justify' | 'left' | 'right';

type Direction = 'asc' | 'desc';

type Sort = Direction | false;

interface FourteenMonthReportTableCellProps {
  isActive: boolean;
  align?: Align;
  children: ReactNode;
  direction: Direction;
  sortDirection: Sort;
  onClick: (
    event: React.MouseEvent<unknown>,
    cellIdx?: string | number,
  ) => void;
}

const HeadCellSpan = styled('span')(() => ({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  top: 20,
  width: 1,
}));

export const TableHeadCell: React.FC<FourteenMonthReportTableCellProps> = ({
  isActive,
  align,
  children,
  direction,
  sortDirection,
  onClick,
}) => {
  return (
    <TableCell align={align} sortDirection={sortDirection} style={{ top: 65 }}>
      <TableSortLabel active={isActive} direction={direction} onClick={onClick}>
        {children}
        {isActive && (
          <HeadCellSpan>
            {direction === 'desc' ? 'sorted descending' : 'sorted ascending'}
          </HeadCellSpan>
        )}
      </TableSortLabel>
    </TableCell>
  );
};
