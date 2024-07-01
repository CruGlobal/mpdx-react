import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestWrapper from '__tests__/util/TestWrapper';
import theme from '../../../theme';
import Appeal from './Appeal';

const appeal = {
  name: 'test 123',
  id: '',
  amount: 100,
  amountCurrency: 'CAD',
  pledgesAmountTotal: 60,
  pledgesAmountProcessed: 10,
  pledgesAmountReceivedNotProcessed: 20,
  pledgesAmountNotReceivedNotProcessed: 30,
};

describe('AppealTest', () => {
  it('regular', () => {
    const changePrimary = jest.fn();
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Appeal
            appeal={appeal}
            primary={false}
            changePrimary={changePrimary}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByText('test 123')).toBeInTheDocument();
    expect(getByText('10.00 / 100.00')).toBeInTheDocument();
    expect(getByText('CA$10 (10%)')).toBeInTheDocument();
    expect(getByText('CA$30 (30%)')).toBeInTheDocument();
    expect(getByText('CA$60 (60%)')).toBeInTheDocument();
  });
});
