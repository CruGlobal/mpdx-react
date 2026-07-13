import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  MpdGoalRow,
  isBoldLine,
  isIndentedLine,
  isTopBorderLine,
  useMpdGoalRows,
} from 'src/hooks/useMpdGoalRows';

interface MpdGoalPrintTableProps {
  supportRaised: number;
}

export const MpdGoalPrintTable: React.FC<MpdGoalPrintTableProps> = ({
  supportRaised,
}) => {
  const { t } = useTranslation();
  const { rows, valueFormatter } = useMpdGoalRows(supportRaised);

  return (
    <TableContainer>
      <Table
        sx={{
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>{t('Line')}</TableCell>
            <TableCell>{t('Category')}</TableCell>
            <TableCell
              sx={{ backgroundColor: 'mpdxBlue.light', whiteSpace: 'nowrap' }}
            >
              {t('NS Reference')}
            </TableCell>
            <TableCell>{t('Amount')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row: MpdGoalRow) => {
            const isBold = isBoldLine(row.line);
            const hasTopBorder = isTopBorderLine(row.line);
            const isIndented = isIndentedLine(row.line);

            return (
              <TableRow
                key={row.line}
                sx={{
                  '& td': {
                    ...(isBold && { fontWeight: 'bold' }),
                    ...(hasTopBorder && { borderTop: '3px solid black' }),
                  },
                }}
              >
                <TableCell>{row.line}</TableCell>
                <TableCell sx={{ pl: isIndented ? 4 : 0 }}>
                  {row.category}
                </TableCell>
                <TableCell sx={{ backgroundColor: 'mpdxBlue.light' }}>
                  {valueFormatter(row.reference, row)}
                </TableCell>
                <TableCell>{valueFormatter(row.amount, row)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
