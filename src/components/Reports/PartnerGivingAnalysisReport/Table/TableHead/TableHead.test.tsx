import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import userEvent from '@testing-library/user-event';
import { PartnerGivingAnalysisReportTableHead, Item } from './TableHead';
import theme from 'src/theme';

const onRequestSort = jest.fn();
const onSelectAll = jest.fn();

const order = 'asc';
const orderBy = 'giftTotal';
const items: Item[] = [{ id: 'giftTotal', label: 'Gift Total' }];

describe('PartnerGivingAnalysisReportTableHead', () => {
  it('default', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PartnerGivingAnalysisReportTableHead
          isSelectedAll={false}
          isSelectedSome={false}
          items={items}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
          onSelectAll={onSelectAll}
        />
      </ThemeProvider>,
    );

    expect(
      queryByTestId('PartnerGivingAnalysisReportTableHead'),
    ).toBeInTheDocument();
  });

  it('sort event', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <PartnerGivingAnalysisReportTableHead
          isSelectedAll={false}
          isSelectedSome={false}
          items={items}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
          onSelectAll={onSelectAll}
        />
      </ThemeProvider>,
    );

    userEvent.click(getByText('Gift Total'));
    expect(onRequestSort).toHaveBeenCalled();
  });

  it('check all event', async () => {
    const { getAllByRole } = render(
      <ThemeProvider theme={theme}>
        <PartnerGivingAnalysisReportTableHead
          isSelectedAll={false}
          isSelectedSome={false}
          items={items}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
          onSelectAll={onSelectAll}
        />
      </ThemeProvider>,
    );

    const checkbox = getAllByRole('checkbox')[0];
    userEvent.click(checkbox);
    expect(onSelectAll).toHaveBeenCalled();
  });
});
