import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { zeroAmountFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { DataFields } from '../mockData';
import { StyledTypography } from '../styledComponents';
import { descriptionWidth, monthWidth, summaryWidth } from './TableCard';

interface TotalsRowProps {
  data: DataFields[];
  overallTotal: number | undefined;
}

export const TotalsRow: React.FC<TotalsRowProps> = ({ data, overallTotal }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.chartBlueLight.main }}>
            <TableCell sx={{ width: descriptionWidth }}>
              <StyledTypography>
                <strong>{t('Overall Total')}</strong>
              </StyledTypography>
            </TableCell>
            {data[0].monthly.map((value, index) => (
              <TableCell key={value} sx={{ width: monthWidth }}>
                <StyledTypography sx={{ textAlign: 'right' }}>
                  <strong>
                    {zeroAmountFormat(
                      data.reduce((sum, row) => sum + row.monthly[index], 0),
                      locale,
                    )}
                  </strong>
                </StyledTypography>
              </TableCell>
            ))}
            <TableCell align="right" sx={{ width: summaryWidth }}>
              <StyledTypography>
                <strong>
                  {zeroAmountFormat(
                    data.reduce((sum, row) => sum + row.average, 0),
                    locale,
                  )}
                </strong>
              </StyledTypography>
            </TableCell>
            <TableCell align="right" sx={{ width: summaryWidth }}>
              <StyledTypography>
                <strong>{zeroAmountFormat(overallTotal, locale)}</strong>
              </StyledTypography>
            </TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </TableContainer>
  );
};
