import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
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
    <Box sx={{ mt: 2 }}>
      <Card sx={{ marginBottom: 2, boxShadow: 1 }}>
        <CardHeader title={title} />
        {showContent && (
          <CardContent>
            <Grid container spacing={2}>
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
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h3" sx={{ color: 'primary.main' }}>
                  <b>
                    {currencyFormat(amountOne || 0, currency, locale, {
                      showTrailingZeros: true,
                    })}
                  </b>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3" sx={{ color: 'primary.main' }}>
                  <b>
                    {currencyFormat(amountTwo || 0, currency, locale, {
                      showTrailingZeros: true,
                    })}
                  </b>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Box>
  );
};
