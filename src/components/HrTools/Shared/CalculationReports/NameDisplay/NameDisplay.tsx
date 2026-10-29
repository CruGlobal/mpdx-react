import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';

export const columnLayout = (columns: number) =>
  columns === 3
    ? { size: { xs: 12, sm: 4 }, amountVariant: 'h5' as const }
    : { size: 6, amountVariant: 'h3' as const };

interface NameDisplayProps {
  names: string;
  showContent?: boolean;
  titleOne?: string;
  titleTwo?: string;
  titleThree?: string;
  amountOne?: number | null;
  amountTwo?: number | null;
  amountThree?: number | null;
  spouseComponent?: React.ReactNode;
}

export const NameDisplay: React.FC<NameDisplayProps> = ({
  names,
  showContent,
  titleOne,
  titleTwo,
  titleThree,
  amountOne,
  amountTwo,
  amountThree,
  spouseComponent,
}) => {
  const locale = useLocale();
  const theme = useTheme();
  const currency = 'USD';
  const columns = [
    { title: titleOne, amount: amountOne, testId: 'amount-one' },
    { title: titleTwo, amount: amountTwo, testId: 'amount-two' },
    ...(titleThree
      ? [{ title: titleThree, amount: amountThree, testId: 'amount-three' }]
      : []),
  ];
  const { size, amountVariant } = columnLayout(columns.length);
  const title = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant="h6">{names}</Typography>
      {spouseComponent}
    </Box>
  );

  return (
    <Box>
      <Card sx={{ marginBottom: theme.spacing(2), boxShadow: 1 }}>
        <CardHeader title={title} sx={{ paddingInline: theme.spacing(4) }} />
        {showContent && (
          <CardContent>
            <Grid container spacing={theme.spacing(2)}>
              {columns.map(({ title: columnTitle, amount, testId }) => (
                <Grid
                  key={testId}
                  size={size}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {columnTitle?.toUpperCase()}
                  </Typography>
                  <Typography
                    variant={amountVariant}
                    fontWeight="bold"
                    sx={{ color: 'primary.main' }}
                    data-testid={testId}
                  >
                    {currencyFormat(amount || 0, currency, locale, {
                      showTrailingZeros: true,
                    })}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        )}
      </Card>
    </Box>
  );
};
