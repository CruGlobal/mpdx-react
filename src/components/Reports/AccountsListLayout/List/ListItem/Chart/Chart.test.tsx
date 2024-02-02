import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import theme from 'src/theme';
import { AccountListItemChart as Chart } from './Chart';

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
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });
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
