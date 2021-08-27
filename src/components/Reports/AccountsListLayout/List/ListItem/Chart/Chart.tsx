import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  styled,
} from '@material-ui/core';
import {
  ReferenceLine,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Text,
} from 'recharts';
import { currencyFormat } from 'src/lib/intlFormat';
import AnimatedCard from 'src/components/AnimatedCard';

type EntryHistory = {
  [key: string]: number | string;
};

const LegendIdentifier = styled(({ color: _color, ...props }) => (
  <div {...props} />
))(({ color }: { color: string }) => ({
  display: 'inline-block',
  height: '5px',
  width: '20px',
  marginRight: '10px',
  marginBottom: '4px',
  borderRadius: '5px',
  backgroundColor: color,
}));

export interface AccountListItemChartProps {
  average: number;
  currencyCode: string;
  data: EntryHistory[];
}

export const AccountListItemChart: FC<AccountListItemChartProps> = ({
  average,
  currencyCode,
  data,
}) => {
  const { t } = useTranslation();
  const fills = ['#FFCF07', '#30F2F2', '#1FC0D2', '#007398'];
  const currencies = [{ dataKey: currencyCode, fill: fills.pop() ?? '' }];

  return (
    <Box width="100%">
      <AnimatedCard>
        <Box display={{ xs: 'none', sm: 'block' }}>
          <CardHeader
            title={
              <Box display={{ xs: 'none', sm: 'block' }}>
                <Grid container spacing={2} justify="center">
                  <Grid item>
                    <LegendIdentifier color="#9C9FA1" />
                    <Typography variant="body1" component="span">
                      <strong>{t('Monthly Average')}</strong>{' '}
                      {currencyFormat(average, currencyCode)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            }
          />
        </Box>
        <CardContent>
          <Box
            display={{ xs: 'none', sm: 'block' }}
            style={{ height: '250px' }}
          >
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={{
                  left: 20,
                  right: 20,
                }}
              >
                <Legend />
                <CartesianGrid vertical={false} />
                <ReferenceLine y={average} stroke="#9C9FA1" strokeWidth={3} />
                <XAxis tickLine={false} dataKey="startDate" />
                <YAxis
                  label={
                    <Text x={0} y={0} dx={20} dy={150} offset={0} angle={-90}>
                      {
                        t('Amount ({{ currencyCode }})', {
                          currencyCode,
                        }) as string
                      }
                    </Text>
                  }
                />
                <Tooltip />
                {currencies.map((currency) => (
                  <Bar
                    key={currency.dataKey}
                    dataKey={currency.dataKey}
                    stackId="a"
                    fill={currency.fill}
                    barSize={30}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box
            display={{ xs: 'block', sm: 'none' }}
            style={{ height: '150px' }}
          >
            <ResponsiveContainer>
              <BarChart data={data}>
                <XAxis tickLine={false} dataKey="startDate" />
                <Tooltip />
                <Bar dataKey="total" fill="#007398" barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};
