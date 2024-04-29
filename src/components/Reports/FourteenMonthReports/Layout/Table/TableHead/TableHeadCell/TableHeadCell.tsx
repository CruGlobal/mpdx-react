import React, { ReactNode } from 'react';
import { TableSortLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import { StyledTableCell } from '../../StyledComponents';

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

const PrintableTableSortLabel = styled(TableSortLabel)(() => ({
  '@media print': {
    display: 'grid',
    '& svg': {
      display: 'none',
    },
  },
}));

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
  '@media print': {
    display: 'none',
  },
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
    <StyledTableCell
      align={align}
      sortDirection={sortDirection}
      style={{ top: 65 }}
    >
      <PrintableTableSortLabel
        active={isActive}
        direction={direction}
        onClick={onClick}
      >
        {children}
        {isActive && (
          <HeadCellSpan>
            {direction === 'desc' ? 'sorted descending' : 'sorted ascending'}
          </HeadCellSpan>
        )}
      </PrintableTableSortLabel>
    </StyledTableCell>
  );
};
