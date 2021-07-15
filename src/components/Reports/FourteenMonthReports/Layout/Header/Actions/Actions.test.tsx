import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import userEvent from '@testing-library/user-event';
import { FourteenMonthReportActions } from './Actions';
import theme from 'src/theme';

const currencyType = 'salary';
const onExpandToggle = jest.fn();
const onPrint = jest.fn();

describe('FourteenMonthReportActions', () => {
  it('default', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <FourteenMonthReportActions
          csvData={[]}
          currencyType={currencyType}
          isExpanded={false}
          isMobile={true}
          onExpandToggle={onExpandToggle}
          onPrint={onPrint}
        />
      </ThemeProvider>,
    );

    expect(
      getByRole('group', { name: 'report header button group' }),
    ).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Expand' }));
    userEvent.click(getByRole('button', { name: 'Print' }));
    userEvent.click(getByRole('button', { name: 'Export' }));
  });

  it('expanded', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <FourteenMonthReportActions
          csvData={[]}
          currencyType={currencyType}
          isExpanded={true}
          isMobile={true}
          onExpandToggle={onExpandToggle}
          onPrint={onPrint}
        />
      </ThemeProvider>,
    );

    expect(
      getByRole('group', { name: 'report header button group' }),
    ).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Hide' }));
    userEvent.click(getByRole('button', { name: 'Print' }));
    userEvent.click(getByRole('button', { name: 'Export' }));
  });
});
