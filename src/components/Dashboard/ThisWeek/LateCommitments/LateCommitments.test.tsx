import React from 'react';
import MockDate from 'mockdate';
import { render } from '../../../../../tests/testingLibraryReactMock';
import LateCommitments from '.';

describe('LateCommitments', () => {
    it('default', () => {
        const { getByTestId, queryByTestId } = render(<LateCommitments accountListId="abc" />);
        expect(getByTestId('LateCommitmentsCardContentEmpty')).toBeInTheDocument();
        expect(queryByTestId('LateCommitmentsDivLoading')).not.toBeInTheDocument();
        expect(queryByTestId('LateCommitmentsListContacts')).not.toBeInTheDocument();
    });

    it('loading', () => {
        const { getByTestId, queryByTestId } = render(<LateCommitments accountListId="abc" loading />);
        expect(queryByTestId('LateCommitmentsCardContentEmpty')).not.toBeInTheDocument();
        expect(getByTestId('LateCommitmentsDivLoading')).toBeInTheDocument();
        expect(queryByTestId('LateCommitmentsListContacts')).not.toBeInTheDocument();
    });

    it('empty', () => {
        const latePledgeContacts = {
            nodes: [],
            totalCount: 0,
        };
        const { getByTestId, queryByTestId } = render(
            <LateCommitments accountListId="abc" latePledgeContacts={latePledgeContacts} />,
        );
        expect(getByTestId('LateCommitmentsCardContentEmpty')).toBeInTheDocument();
        expect(queryByTestId('LateCommitmentsDivLoading')).not.toBeInTheDocument();
        expect(queryByTestId('LateCommitmentsListContacts')).not.toBeInTheDocument();
    });

    describe('MockDate', () => {
        beforeEach(() => {
            MockDate.set(new Date(2020, 1, 1));
        });
        afterEach(() => {
            MockDate.reset();
        });
        it('props', () => {
            const latePledgeContacts = {
                nodes: [
                    {
                        id: 'contact1',
                        name: 'Smith, Sarah',
                        lateAt: '2012-10-01',
                    },
                    {
                        id: 'contact2',
                        name: 'Smith, John',
                        lateAt: '2015-12-01',
                    },
                ],
                totalCount: 1595,
            };
            const { getByTestId, queryByTestId } = render(
                <LateCommitments accountListId="abc" latePledgeContacts={latePledgeContacts} />,
            );
            expect(queryByTestId('LateCommitmentsCardContentEmpty')).not.toBeInTheDocument();
            expect(queryByTestId('LateCommitmentsDivLoading')).not.toBeInTheDocument();
            expect(getByTestId('LateCommitmentsButtonViewAll').textContent).toEqual('View All (1,595)');
            const contact1Element = getByTestId('LateCommitmentsListItemContact-contact1');
            expect(contact1Element).toHaveAttribute('href', '/accountLists/abc/contacts/contact1');
            expect(contact1Element.textContent).toEqual('Smith, SarahTheir gift is 2,679 days late.');
            const contact2Element = getByTestId('LateCommitmentsListItemContact-contact2');
            expect(contact2Element).toHaveAttribute('href', '/accountLists/abc/contacts/contact2');
            expect(contact2Element.textContent).toEqual('Smith, JohnTheir gift is 1,523 days late.');
        });
    });
});
