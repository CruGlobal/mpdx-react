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
import { missingValue } from '../../helpers/missingValue';

export const columnLayout = (columns: number) =>
  columns === 3
    ? { size: { xs: 12, md: 4 }, amountVariant: 'h5' as const }
    : {
        size: { xs: 12, sm: 6 },
        amountVariant: 'h3' as const,
        phoneAmountVariant: 'h4' as const,
      };

interface NameDisplayProps {
  names: string;
  showContent?: boolean;
  titleOne?: string;
  // Rendered beside the first title, such as an info icon explaining its amount
  titleOneAdornment?: React.ReactNode;
  titleTwo?: string;
  titleThree?: string;
  amountOne?: number | null;
  amountTwo?: number | null;
  amountThree?: number | null;
  spouseComponent?: React.ReactNode;
  // A full-width caption under the amounts
  note?: string | null;
}

export const NameDisplay: React.FC<NameDisplayProps> = ({
  names,
  showContent,
  titleOne,
  titleOneAdornment,
  titleTwo,
  titleThree,
  amountOne,
  amountTwo,
  amountThree,
  spouseComponent,
  note,
}) => {
  const locale = useLocale();
  const theme = useTheme();
  const currency = 'USD';
  const columns = [
    {
      title: titleOne,
      adornment: titleOneAdornment,
      amount: amountOne,
      testId: 'amount-one',
    },
    { title: titleTwo, amount: amountTwo, testId: 'amount-two' },
    ...(titleThree
      ? [{ title: titleThree, amount: amountThree, testId: 'amount-three' }]
      : []),
  ];
  const { size, amountVariant, phoneAmountVariant } = columnLayout(
    columns.length,
  );
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
              {columns.map(
                ({ title: columnTitle, adornment, amount, testId }) => (
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
                      {adornment}
                    </Typography>
                    <Typography
                      variant={amountVariant}
                      fontWeight="bold"
                      sx={{
                        color: 'primary.main',
                        ...(phoneAmountVariant && {
                          [theme.breakpoints.down('sm')]: {
                            fontSize:
                              theme.typography[phoneAmountVariant].fontSize,
                          },
                        }),
                      }}
                      data-testid={testId}
                    >
                      {typeof amount === 'number'
                        ? currencyFormat(amount, currency, locale, {
                            showTrailingZeros: true,
                          })
                        : missingValue}
                    </Typography>
                  </Grid>
                ),
              )}
            </Grid>
            {note && (
              <Typography
                variant="caption"
                color="text.secondary"
                component="p"
                sx={{ marginTop: theme.spacing(2) }}
              >
                {note}
              </Typography>
            )}
          </CardContent>
        )}
      </Card>
    </Box>
  );
};
