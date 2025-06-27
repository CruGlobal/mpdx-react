import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TwelveMonthReportCurrencyType } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { TwelveMonthReportActions } from './Actions';

const onExpandToggle = jest.fn();
const onPrint = jest.fn();

describe('TwelveMonthReportActions', () => {
  it('default', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TwelveMonthReportActions
          csvData={[]}
          currencyType={TwelveMonthReportCurrencyType.Salary}
          isExpanded={false}
          isMobile={true}
          onExpandToggle={onExpandToggle}
          onPrint={onPrint}
        />
      </ThemeProvider>,
    );

    expect(
      getByRole('group', { name: 'Report header button group' }),
    ).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Expand' }));
    userEvent.click(getByRole('button', { name: 'Print' }));
    expect(getByRole('link', { name: 'Export' })).toHaveAttribute(
      'href',
      'data:text/csv;charset=utf-8,\uFEFF',
    );
  });

  it('expand toggle event', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TwelveMonthReportActions
          csvData={[]}
          currencyType={TwelveMonthReportCurrencyType.Salary}
          isExpanded={true}
          isMobile={true}
          onExpandToggle={onExpandToggle}
          onPrint={onPrint}
        />
      </ThemeProvider>,
    );

    userEvent.click(getByRole('button', { name: 'Hide' }));
    expect(onExpandToggle).toHaveBeenCalled();
  });

  it('print event', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TwelveMonthReportActions
          csvData={[]}
          currencyType={TwelveMonthReportCurrencyType.Salary}
          isExpanded={true}
          isMobile={true}
          onExpandToggle={onExpandToggle}
          onPrint={onPrint}
        />
      </ThemeProvider>,
    );

    userEvent.click(getByRole('button', { name: 'Print' }));
    expect(onPrint).toHaveBeenCalled();
  });
});
