import React from 'react';
import {
  Box,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useLocale } from 'src/hooks/useLocale';
import cruLogo from 'src/images/cru/cru.svg';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';

const pieData = [
  { name: 'Salary', value: 1000 },
  { name: 'Ministry Expenses', value: 200 },
  { name: 'Benefits', value: 400 },
  { name: 'Social Security and Taxes', value: 300 },
  { name: 'Voluntary 403b Retirement Plan', value: 1900 },
  { name: 'Administrative Charge', value: 150 },
];

const chartColors = [
  theme.palette.primary.main,
  theme.palette.success.main,
  theme.palette.warning.main,
  theme.palette.error.main,
  theme.palette.secondary.main,
  theme.palette.info.main,
];

export const PresentingYourGoal: React.FC = () => {
  const { data: userData } = useGetUserQuery();
  const { t } = useTranslation();
  const locale = useLocale();

  // Left side panel takes a generous amount of space, so using lg breakpoint
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        justifySelf: 'center',
        mb: theme.spacing(4),
        width: '100%',
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t('Personal Information')}
            </Typography>
            <Divider sx={{ mb: 2, mt: 2, mx: -3 }} />
            <TableContainer>
              <Table size="small">
                <TableBody
                  sx={{ '& .MuiTableRow-root .MuiTableCell-root': { py: 2 } }}
                >
                  <TableRow>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      <Typography variant="body1" fontWeight="bold">
                        {t('Name')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      {userData?.user
                        ? `${userData.user.firstName} ${userData.user.lastName}`
                        : 'John Doe'}
                    </TableCell>
                    <TableCell
                      sx={{ borderBottom: 'none', textAlign: 'center' }}
                      rowSpan={3}
                    >
                      <Box sx={{ pb: theme.spacing(2) }}>
                        <img
                          src={cruLogo}
                          alt={'Campus Crusade for Christ, Inc. logo'}
                          style={{
                            width: 150,
                            height: 'auto',
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      <Typography variant="body1" fontWeight="bold">
                        {t('Mission Agency')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      {t('Campus Crusade for Christ, Inc.')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      <Typography variant="body1" fontWeight="bold">
                        {t('Ministry Location')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      Orlando, FL
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t('Monthly Support Needs')}
            </Typography>
            <Divider sx={{ mb: 2, mt: 2, mx: -3 }} />
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {[
                    {
                      title: t('Salary'),
                      description: t(
                        'Salaries are based upon marital status, number of children, tenure with Cru, and adjustments for certain geographic locations.',
                      ),
                      amount: currencyFormat(1000, 'USD', locale),
                    },
                    {
                      title: t('Ministry Expenses'),
                      description: t(
                        'Training, conferences, supplies, evangelism & discipleship materials, communication with ministry partners, ministry travel expenses, etc.',
                      ),
                      amount: currencyFormat(200, 'USD', locale),
                    },
                    {
                      title: t('Benefits'),
                      description: t(
                        "Includes group medical and dental coverage, life insurance, disability insurance, worker's compensation, and employer contribution to a 403(b) retirement plan.",
                      ),
                      amount: currencyFormat(400, 'USD', locale),
                    },
                    {
                      title: t('Social Security and Taxes'),
                      description: t(
                        'Since Campus Crusade is a non-profit organization, staff members are responsible for paying the entire amount of Social Security.',
                      ),
                      amount: currencyFormat(300, 'USD', locale),
                    },
                    {
                      title: t('Voluntary 403b Retirement Plan'),
                      description: t(
                        'Staff members are eligible to contribute to a voluntary retirement program each month.',
                      ),
                      amount: currencyFormat(1900, 'USD', locale),
                    },
                    {
                      title: t('Administrative Charge'),
                      amount: currencyFormat(150, 'USD', locale),
                    },
                    {
                      title: t('Total Support Goal'),
                      amount: currencyFormat(3950, 'USD', locale),
                      amountFontWeight: 'bold',
                    },
                    {
                      title: t('Total Solid Support'),
                      amount: currencyFormat(2500, 'USD', locale),
                    },
                  ].map((item, index, array) => (
                    <TableRow
                      key={index}
                      sx={{
                        td: {
                          borderBottom:
                            index !== array.length - 1 ? '1px solid' : 'none',
                          borderBottomColor: 'divider',
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Typography
                          sx={{ fontWeight: item.amountFontWeight || 'normal' }}
                          variant="body1"
                        >
                          {item.amount}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t('Monthly Support Breakdown')}
            </Typography>
            <Divider sx={{ mb: 2, mt: 2, mx: -3 }} />
            <Box
              width="50%"
              justifyContent={isMobile ? 'center' : 'flex-end'}
              mx="auto"
            >
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="45%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={160}
                    paddingAngle={4}
                    cornerRadius={theme.shape.borderRadius}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => {
                      const total = pieData.reduce(
                        (sum, entry) => sum + entry.value,
                        0,
                      );
                      const percent = total
                        ? ((Number(value) / total) * 100).toFixed(1)
                        : 0;
                      return `$${value} (${percent}%)`;
                    }}
                  />
                  <Legend
                    layout={!isMobile ? 'vertical' : 'horizontal'}
                    align="right"
                    verticalAlign={!isMobile ? 'middle' : 'bottom'}
                    wrapperStyle={{
                      fontSize: !isMobile
                        ? theme.typography.h5.fontSize
                        : theme.typography.subtitle1.fontSize,
                      paddingRight: theme.spacing(8),
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
