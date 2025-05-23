import React, { FC } from 'react';
import { Box, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AnimatedCard from 'src/components/AnimatedCard';
import { StyledBarChart } from 'src/components/common/StyledBarChart/StyledBarChart';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import type { Theme } from '@mui/material/styles/createTheme';

type EntryHistory = {
  [key: string]: number | string;
};

const LegendIdentifier = styled('div', {
  shouldForwardProp: (prop) => prop !== 'color',
})(({ color }: { color: string }) => ({
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
  const locale = useLocale();
  const theme = useTheme<Theme>();

  return (
    <Box width="100%" data-testid="AccountItemChart">
      <AnimatedCard>
        <Box display={{ xs: 'none', sm: 'block' }}>
          <CardHeader
            title={
              <Box display={{ xs: 'none', sm: 'block' }}>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item>
                    <LegendIdentifier color={theme.palette.secondary.dark} />
                    <Typography variant="body1" component="span">
                      <strong>{t('Monthly Average')}</strong>{' '}
                      {currencyFormat(average, currencyCode, locale)}
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
              <StyledBarChart
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
              </StyledBarChart>
            </ResponsiveContainer>
          </Box>
          <Box
            display={{ xs: 'block', sm: 'none' }}
            style={{ height: '150px' }}
          >
            <ResponsiveContainer>
              <StyledBarChart data={data}>
                <XAxis tickLine={false} dataKey="startDate" />
                <Tooltip />
                <Bar
                  dataKey="total"
                  fill={theme.palette.primary.main}
                  barSize={10}
                />
              </StyledBarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};
