import React from 'react';
import { render } from '@testing-library/react';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import Appeal from './Appeal';

describe('AppealTest', () => {
  it('regular', () => {
    const { getByText } = render(
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
      </TestWrapper>,
    );
    expect(getByText('test 123')).toBeInTheDocument();
    expect(getByText('10.00 / 100.00')).toBeInTheDocument();
    expect(getByText('10 CAD (10%)')).toBeInTheDocument();
    expect(getByText('30 CAD (30%)')).toBeInTheDocument();
    expect(getByText('60 CAD (60%)')).toBeInTheDocument();
  });
});
