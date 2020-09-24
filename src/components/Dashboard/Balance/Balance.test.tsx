import React from 'react';
import { render } from '@testing-library/react';
import Balance from '.';

describe('Balance', () => {
    it('default', () => {
        const { getByTestId } = render(<Balance balance={1000.99} />);
        expect(getByTestId('BalanceTypography').textContent).toEqual('$1,001');
    });

    it('custom props', () => {
        const { getByTestId } = render(<Balance balance={1000.99} currencyCode="EUR" />);
        expect(getByTestId('BalanceTypography').textContent).toEqual('€1,001');
    });

    it('loading', () => {
        const { getByTestId } = render(<Balance loading={true} />);
        expect(getByTestId('BalanceTypography').children[0].className).toContain('MuiSkeleton-root');
    });
});
