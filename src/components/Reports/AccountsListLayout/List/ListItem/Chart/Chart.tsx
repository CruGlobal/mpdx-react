import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  useTheme,
  styled,
} from '@material-ui/core';
import type { Theme } from '@material-ui/core/styles/createMuiTheme';
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
  data: EntryHistory[] | undefined;
}

export const AccountListItemChart: FC<AccountListItemChartProps> = ({
  average,
  currencyCode,
  data,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<Theme>();

  return (
    <Box width="100%" data-testid="AccountItemChart">
      <AnimatedCard>
        <Box display={{ xs: 'none', sm: 'block' }}>
          <CardHeader
            title={
              <Box display={{ xs: 'none', sm: 'block' }}>
                <Grid container spacing={2} justify="center">
                  <Grid item>
                    <LegendIdentifier color={theme.palette.secondary.dark} />
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
                <ReferenceLine
                  y={average}
                  stroke={theme.palette.secondary.dark}
                  strokeWidth={3}
                />
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
                <Bar
                  dataKey={currencyCode}
                  stackId="a"
                  fill={theme.palette.primary.main}
                  barSize={30}
                />
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
                <Bar
                  dataKey="total"
                  fill={theme.palette.primary.main}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};
