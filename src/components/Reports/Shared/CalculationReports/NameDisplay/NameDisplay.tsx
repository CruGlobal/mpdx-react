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
}

export const NameDisplay: React.FC<NameDisplayProps> = ({
  names,
  personNumbers,
  showContent,
  titleOne,
  titleTwo,
  amountOne,
  amountTwo,
}) => {
  const locale = useLocale();
  const theme = useTheme();
  const currency = 'USD';

  const title = (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6">{names}</Typography>
      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
        {personNumbers}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ mt: theme.spacing(2) }}>
      <Card sx={{ marginBottom: theme.spacing(2), boxShadow: 1 }}>
        <CardHeader title={title} />
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
