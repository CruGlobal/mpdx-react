import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LegendProps } from 'recharts';
import { ChartLegendContent } from '../ChartLegendContent/ChartLegendContent';
import { AverageSeries, averageDash } from './averageReferenceLines';

interface AverageKeyProps {
  series: AverageSeries[];
  formatCurrency: (value: number) => string;
  note?: string;
  // The bars' legend, shown under the key outside the chart so it can't
  // overlap the plot on a phone
  legend: LegendProps['payload'];
}

// A key row above the chart, like the Dashboard's Monthly Giving chart: a
// dashed swatch matching each average line, its name in bold, then the amount
export const AverageKey: React.FC<AverageKeyProps> = ({
  series,
  formatCurrency,
  note,
  legend,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid
        container
        columnSpacing={2}
        justifyContent="center"
        alignItems="center"
        mb={1}
        data-testid="MonthlySummaryAverageKey"
      >
        {series.map(({ key, name, color, value }) => (
          <Grid key={key}>
            <svg
              aria-hidden="true"
              width={20}
              height={10}
              style={{ marginRight: 8 }}
            >
              <line
                x1={0}
                y1={5}
                x2={20}
                y2={5}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={averageDash}
              />
            </svg>
            <Typography variant="body2" component="span">
              <strong>{t('{{name}} average', { name })}</strong>{' '}
              {formatCurrency(value)}
            </Typography>
          </Grid>
        ))}
        {note && (
          <Grid>
            <Typography variant="body2" component="span" color="text.secondary">
              {note}
            </Typography>
          </Grid>
        )}
      </Grid>
      <ChartLegendContent payload={legend} />
    </>
  );
};
