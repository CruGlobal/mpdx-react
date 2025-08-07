import React, { useMemo, useRef } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  styled,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

const ChartContainer = styled(Box)(({ theme }) => ({
  width: '70%',
  height: 500,

  [theme.breakpoints.down('lg')]: {
    width: '100%',
  },

  '@media print': {
    width: '100% !important',
    height: '350px !important',
    '.recharts-wrapper': {
      height: '100px !important',
      width: '100% !important',
    },
    '.recharts-surface': {
      height: '350px !important',
      width: '100% !important',
    },
    '.recharts-legend-wrapper': {
      fontSize: '16px !important',
      paddingRight: '20px !important',
      textAlign: 'center !important',
    },
  },

  '& .recharts-legend-item .recharts-surface': {
    width: '16px !important',
    height: '16px !important',
    top: '2px',
  },

  '& .recharts-legend-item text': {
    dominantBaseline: 'middle',
  },
}));

const StyledTableCell = styled(TableCell)({
  border: 'none',
  paddingTop: 16,
  paddingBottom: 16,
});

const mockData = [
  { name: 'Salary', value: 1000 },
  {
    name: 'Ministry Expenses',
    value: 200,
  },
  { name: 'Benefits', value: 400 },
  {
    name: 'Social Security and Taxes',
    value: 300,
  },
  {
    name: 'Voluntary 403b Retirement Plan',
    value: 1900,
  },
  {
    name: 'Administrative Charge',
    value: 150,
  },
];

interface PersonalInfoRow {
  label: string;
  value?: string;
}

interface PresentingYourGoalRow {
  title: string;
  description?: string;
  amount: number;
  bold?: boolean;
}

export const PresentingYourGoal: React.FC = () => {
  const { data: userData } = useGetUserQuery();
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Made useMemo for when real data is added.
  const total = useMemo(
    () => mockData.reduce((sum, entry) => sum + entry.value, 0),
    [mockData],
  );

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const formatPercent = (value: number) =>
    total ? ((value / total) * 100).toFixed(2) : '0';

  // Consider adding more brand colors to theme.
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const personalInfoRows: PersonalInfoRow[] = useMemo(
    () => [
      {
        label: 'Name',
        value: userData?.user
          ? `${userData.user.firstName} ${userData.user.lastName}`
          : t('User'),
      },
      {
        label: t('Mission Agency'),
        value: t('Campus Crusade for Christ, Inc.'),
      },
      { label: t('Ministry Location'), value: t('Orlando, FL') },
    ],
    [userData?.user, t],
  );

  const rows: PresentingYourGoalRow[] = useMemo(
    () => [
      {
        title: 'Salary',
        description:
          'Salaries are based upon marital status, number of children, tenure with Cru, and adjustments for certain geographic locations.',
        amount: mockData[0].value,
      },
      {
        title: 'Ministry Expenses',
        description:
          'Training, conferences, supplies, evangelism & discipleship materials, communication with ministry partners, ministry travel expenses, etc.',
        amount: mockData[1].value,
      },
      {
        title: 'Benefits',
        description:
          "Includes group medical and dental coverage, life insurance, disability insurance, worker's compensation, and employer contribution to a 403(b) retirement plan.",
        amount: mockData[2].value,
      },
      {
        title: 'Social Security and Taxes',
        description:
          'Since Campus Crusade is a non-profit organization, staff members are responsible for paying the entire amount of Social Security.',
        amount: mockData[3].value,
      },
      {
        title: 'Voluntary 403b Retirement Plan',
        description:
          'Staff members are eligible to contribute to a voluntary retirement program each month.',
        amount: mockData[4].value,
      },
      { title: 'Administrative Charge', amount: mockData[5].value },
      { title: 'Total Support Goal', amount: total, bold: true },
      // change amount when real data is added
      { title: 'Total Solid Support', amount: 2500 },
    ],
    [mockData, total, t],
  );

  return (
    <Grid container spacing={theme.spacing(6)}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
        }}
      >
        <Button
          variant="outlined"
          endIcon={<PrintIcon />}
          onClick={handlePrint}
          aria-label={t('Print')}
        >
          {t('Print')}
        </Button>
      </Box>
      <Grid ref={printRef} item xs={12}>
        <Paper
          sx={{ padding: theme.spacing(3), marginBottom: theme.spacing(3) }}
        >
          <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h5">
            {t('Personal Information')}
          </Typography>

          <Divider
            sx={{ margin: `${theme.spacing(2)} ${theme.spacing(-3)}` }}
          />

          <Table size="small">
            <TableBody>
              {personalInfoRows.map((item, index) => (
                <TableRow key={item.label}>
                  <StyledTableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {item.label}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell data-testid="value-typography">
                    {item.value}
                  </StyledTableCell>
                  {index === 0 && (
                    <StyledTableCell sx={{ textAlign: 'center' }} rowSpan={3}>
                      <img
                        src={cruLogo}
                        alt={t('Campus Crusade for Christ, Inc. logo')}
                        style={{ width: 150, height: 'auto' }}
                      />
                    </StyledTableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Paper
          sx={{ padding: theme.spacing(3), marginBottom: theme.spacing(3) }}
        >
          <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h5">
            {t('Monthly Support Needs')}
          </Typography>

          <Divider
            sx={{ margin: `${theme.spacing(2)} ${theme.spacing(-3)}` }}
          />

          <Table size="small">
            <TableBody>
              {rows.map((item, index, array) => (
                <TableRow
                  key={item.title}
                  sx={{
                    '& td': {
                      borderBottom:
                        index < array.length - 1 ? '1px solid' : 'none',
                      borderBottomColor: 'divider',
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {t(item.title)}
                    </Typography>
                    {item.description && (
                      <Typography
                        variant="body2"
                        color={theme.palette.text.secondary}
                        sx={{ mt: 1 }}
                      >
                        {t(item.description)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Typography
                      data-testid="amount-typography"
                      variant="body1"
                      fontWeight={item.bold ? 'bold' : 'normal'}
                    >
                      {currencyFormat(item.amount, 'USD', locale)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Paper
          sx={{
            padding: theme.spacing(3),
            marginBottom: theme.spacing(3),
            '@media print': {
              pageBreakInside: 'avoid',
            },
          }}
        >
          <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h5">
            {t('Monthly Support Breakdown')}
          </Typography>

          <Divider
            sx={{ margin: `${theme.spacing(2)} ${theme.spacing(-3)}` }}
          />

          <ChartContainer>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={mockData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 100 : 180}
                  cornerRadius={theme.shape.borderRadius}
                >
                  {mockData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    `${currencyFormat(
                      Number(value),
                      'USD',
                      locale,
                    )} (${formatPercent(Number(value))}%)`
                  }
                />
                <Legend
                  layout={isMobile ? 'horizontal' : 'vertical'}
                  align="right"
                  verticalAlign={isMobile ? 'bottom' : 'middle'}
                  wrapperStyle={{
                    fontSize: isMobile
                      ? theme.typography.subtitle1.fontSize
                      : theme.typography.h5.fontSize,
                    paddingRight: isMobile ? 0 : theme.spacing(30),
                  }}
                  iconSize={16}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};
