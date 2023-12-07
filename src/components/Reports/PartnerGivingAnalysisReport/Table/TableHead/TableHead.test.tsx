import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { Item, PartnerGivingAnalysisReportTableHead } from './TableHead';

const onRequestSort = jest.fn();

const order = 'asc';
const orderBy = 'giftTotal';
const items: Item[] = [{ id: 'donationPeriodSum', label: 'Gift Total' }];

describe('PartnerGivingAnalysisReportTableHead', () => {
  it('default', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PartnerGivingAnalysisReportTableHead
          items={items}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
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
          items={items}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
        />
      </ThemeProvider>,
    );

    userEvent.click(getByText('Gift Total'));
    expect(onRequestSort).toHaveBeenCalled();
  });
});
