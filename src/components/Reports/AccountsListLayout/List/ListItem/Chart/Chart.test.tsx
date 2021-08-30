import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { AccountListItemChart as Chart } from './Chart';
import theme from 'src/theme';

const averageMock = 123;
const currencyCodeMock = 'CAD';
const dataMock = [
  {
    CAD: 22,
    startDate: 'Apr 21',
    total: 22,
  },
];

describe('AccountItemChart', () => {
  it('default', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <Chart
          average={averageMock}
          currencyCode={currencyCodeMock}
          data={dataMock}
        />
      </ThemeProvider>,
    );

    expect(getByTestId('AccountItemChart')).toBeInTheDocument();
    expect(getByText('CA$123')).toBeInTheDocument();
  });
});
