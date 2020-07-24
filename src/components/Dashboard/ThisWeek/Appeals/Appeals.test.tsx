import React from 'react';
import { render } from '@testing-library/react';
import Appeals from '.';

describe(Appeals.name, () => {
    it('default', () => {
        const { getByTestId } = render(<Appeals />);
        expect(getByTestId('AppealsCardContentEmpty')).toBeInTheDocument();
    });

    it('loading', () => {
        const { getByTestId } = render(<Appeals loading />);
        expect(getByTestId('AppealsBoxName').children[0].className).toContain('MuiSkeleton-root');
        expect(getByTestId('AppealsBoxAmount').children[0].className).toContain('MuiSkeleton-root');
        expect(getByTestId('AppealsTypographyPledgesAmountProcessedPercentage').children[0].className).toContain(
            'MuiSkeleton-root',
        );
        expect(getByTestId('AppealsTypographyPledgesAmountProcessed').children[0].className).toContain(
            'MuiSkeleton-root',
        );
        expect(getByTestId('AppealsTypographyPledgesAmountTotalPercentage').children[0].className).toContain(
            'MuiSkeleton-root',
        );
        expect(getByTestId('AppealsTypographyPledgesAmountTotal').children[0].className).toContain('MuiSkeleton-root');
    });

    it('props', () => {
        const appeal = {
            id: 'appealId',
            name: 'My Appeal',
            amount: 4999.99,
            pledgesAmountTotal: 2499.99,
            pledgesAmountProcessed: 999.99,
            amountCurrency: 'EUR',
        };
        const { getByTestId } = render(<Appeals appeal={appeal} />);
        expect(getByTestId('AppealsBoxName').textContent).toEqual('My Appeal');
        expect(getByTestId('AppealsBoxAmount').textContent).toEqual('€5,000');
        expect(getByTestId('AppealsTypographyPledgesAmountProcessedPercentage').textContent).toEqual('20%');
        expect(getByTestId('AppealsTypographyPledgesAmountProcessed').textContent).toEqual('€1,000');
        expect(getByTestId('AppealsTypographyPledgesAmountTotalPercentage').textContent).toEqual('50%');
        expect(getByTestId('AppealsTypographyPledgesAmountTotal').textContent).toEqual('€2,500');
    });
});
