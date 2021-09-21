import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import userEvent from '@testing-library/user-event';
import { PartnerGivingAnalysisReportTableHead } from './TableHead';
import theme from 'src/theme';

const onRequestSort = jest.fn();

const order = 'asc';
const orderBy = 'giftTotal';
const items = [
  { id: 'test item 01', label: 'Test Item 01' },
  { id: 'test item 02', label: 'Test Item 02' },
];

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
