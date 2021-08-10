import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { FourteenMonthReportCurrencyType } from '../../../../../../graphql/types.generated';
import { FourteenMonthReportHeader } from './Header';
import theme from 'src/theme';

const title = 'test title';
const onExpandToggle = jest.fn();
const onNavListToggle = jest.fn();
const onPrint = jest.fn();

describe('FourteenMonthReportHeader', () => {
  it('default', async () => {
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <FourteenMonthReportHeader
          csvData={[]}
          currencyType={FourteenMonthReportCurrencyType.Salary}
          isExpanded={true}
          isMobile={true}
          isNavListOpen={true}
          title={title}
          onExpandToggle={onExpandToggle}
          onNavListToggle={onNavListToggle}
          onPrint={onPrint}
        />
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('FourteenMonthReportHeader')).toBeInTheDocument();
  });
});
