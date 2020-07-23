import React from 'react';
import { render } from '@testing-library/react';
import Balance from '.';

describe(Balance.name, () => {
    it('default', () => {
        const { getByText } = render(<Balance balance={1000.99} />);
        expect(getByText('$1,001')).toBeInTheDocument();
    });

    it('custom props', () => {
        const { getByText } = render(<Balance balance={1000.99} currencyCode="EUR" />);
        expect(getByText('€1,001')).toBeInTheDocument();
    });

    it('loading', () => {
        const { getByTestId } = render(<Balance loading={true} />);
        expect(getByTestId('BalanceLoading')).toBeInTheDocument();
    });
});
