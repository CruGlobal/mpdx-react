import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { MonthEndBalances } from './MonthEndBalances';

const renderBalances = (
  balances: React.ComponentProps<typeof MonthEndBalances>['balances'],
) =>
  render(
    <ThemeProvider theme={theme}>
      <MonthEndBalances balances={balances} />
    </ThemeProvider>,
  );

const chipFor = (text: string, getByText: (text: string) => HTMLElement) =>
  getByText(text).closest('.MuiChip-root');

describe('MonthEndBalances', () => {
  it.each([
    {
      status: MpdHealthStatusEnum.Yellow,
      endBalance: 6100,
      amount: '$6,100',
      label: 'Below buffer',
      background: theme.palette.chipYellowLight.main,
    },
    {
      status: MpdHealthStatusEnum.Blue,
      endBalance: 1200,
      amount: '$1,200',
      label: 'Not graded',
      background: theme.palette.chipBlueLight.main,
    },
    {
      status: MpdHealthStatusEnum.Gray,
      endBalance: null,
      amount: '-',
      label: 'No data',
      background: theme.palette.chipGrayLight.main,
    },
  ])('colors and names a $status month', (row) => {
    const { getByText } = renderBalances([
      { month: '2026-10', endBalance: row.endBalance, status: row.status },
    ]);
    const chip = chipFor(row.amount, getByText);

    expect(chip).toHaveTextContent(`Oct 2026, ${row.label}${row.amount}`);
    expect(chip).toHaveStyle({ backgroundColor: row.background });
  });

  it('says a gray month with an amount is not graded yet, not no data', () => {
    const { getByText } = renderBalances([
      { month: '2026-10', endBalance: 1200, status: MpdHealthStatusEnum.Gray },
    ]);
    const chip = chipFor('$1,200', getByText);

    expect(chip).toHaveTextContent(
      'Oct 2026, Not graded yet, before their first payroll$1,200',
    );
    expect(chip).not.toHaveTextContent('No data');
    expect(chip).toHaveStyle({
      backgroundColor: theme.palette.chipGrayLight.main,
    });
  });
});
