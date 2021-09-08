import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import Appeal from './Appeal';

describe('AppealTest', () => {
  it('regular', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Appeal
            name={'test 123'}
            id={''}
            primary={false}
            amount={100}
            amountCurrency={'CAD'}
            given={10}
            received={20}
            commited={30}
            total={60}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByText('test 123')).toBeInTheDocument();
    expect(getByText('10.00 / 100.00')).toBeInTheDocument();
    expect(getByText('10 CAD (10%)')).toBeInTheDocument();
    expect(getByText('30 CAD (30%)')).toBeInTheDocument();
    expect(getByText('60 CAD (60%)')).toBeInTheDocument();
  });
});
