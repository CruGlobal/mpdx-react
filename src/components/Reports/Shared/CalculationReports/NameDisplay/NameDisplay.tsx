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

interface NameDisplayProps {
  names: string;
  personNumbers: string;
  showContent?: boolean;
  titleOne?: string;
  titleTwo?: string;
  amountOne?: number | null;
  amountTwo?: number | null;
  spouseComponent?: React.ReactNode;
}

export const NameDisplay: React.FC<NameDisplayProps> = ({
  names,
  personNumbers,
  showContent,
  titleOne,
  titleTwo,
  amountOne,
  amountTwo,
  spouseComponent,
}) => {
  const locale = useLocale();
  const theme = useTheme();
  const currency = 'USD';
  const title = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6">{names}</Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: 'text.secondary' }}
          data-testid="person-numbers"
        >
          {personNumbers}
        </Typography>
      </Box>
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
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {titleOne?.toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {titleTwo?.toUpperCase()}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={theme.spacing(2)}>
              <Grid item xs={6}>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: 'primary.main' }}
                  data-testid="amount-one"
                >
                  {currencyFormat(amountOne || 0, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: 'primary.main' }}
                  data-testid="amount-two"
                >
                  {currencyFormat(amountTwo || 0, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Box>
  );
};
