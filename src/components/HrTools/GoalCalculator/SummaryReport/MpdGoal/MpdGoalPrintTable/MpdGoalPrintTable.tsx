import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MpdGoalRow, useMpdGoalRows } from 'src/hooks/useMpdGoalRows';

interface MpdGoalTableProps {
  supportRaised: number;
}

export const MpdGoalPrintTable: React.FC<MpdGoalTableProps> = ({
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
            const isBold = ['1J', '6', '8'].includes(row.line);
            const hasTopBorder = ['1', '6'].includes(row.line);
            const isIndented = /[a-z]/i.test(row.line);

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
