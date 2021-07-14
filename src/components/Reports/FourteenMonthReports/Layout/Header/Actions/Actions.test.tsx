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
    const { getByRole, getByText } = render(
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

    expect(getByText('Print')).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Expand User Info Icon' }));
    userEvent.click(getByRole('img', { name: 'Print Icon' }));
    userEvent.click(getByRole('img', { name: 'Print Icon' }));
  });
});
