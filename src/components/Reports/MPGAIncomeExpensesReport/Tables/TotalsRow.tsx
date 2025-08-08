import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataFields } from '../mockData';
import { StyledTypography } from '../styledComponents';
import { descriptionWidth, monthWidth, summaryWidth } from './TableCard';

interface TotalsRowProps {
  data: DataFields[];
  overallTotal: number | undefined;
}

export const TotalsRow: React.FC<TotalsRowProps> = ({ data, overallTotal }) => {
  const { t } = useTranslation();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#BBDEFB' }}>
            <TableCell sx={{ width: descriptionWidth }}>
              <StyledTypography>
                <strong>{t('Overall Total')}</strong>
              </StyledTypography>
            </TableCell>
            {data[0].monthly.map((_, index) => (
              <TableCell key={index} sx={{ width: monthWidth }}>
                <StyledTypography>
                  <strong>
                    {data
                      .reduce((sum, data) => sum + data.monthly[index], 0)
                      .toLocaleString() === '0'
                      ? '-'
                      : data
                          .reduce((sum, data) => sum + data.monthly[index], 0)
                          .toLocaleString()}
                  </strong>
                </StyledTypography>
              </TableCell>
            ))}
            <TableCell align="right" sx={{ width: summaryWidth }}>
              <StyledTypography>
                <strong>
                  {data
                    .reduce((sum, data) => sum + data.average, 0)
                    .toLocaleString()}
                </strong>
              </StyledTypography>
            </TableCell>
            <TableCell align="right" sx={{ width: summaryWidth }}>
              <StyledTypography>
                <strong>{overallTotal?.toLocaleString()}</strong>
              </StyledTypography>
            </TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </TableContainer>
  );
};
