import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { DrawerProviderContext } from '../../Drawer/Provider';
import { GetThisWeekEmptyMocks, GetThisWeekLoadingMocks, GetThisWeekDefaultMocks } from './ThisWeek.mock';
import ThisWeek from '.';

jest.mock('../../Drawer', () => ({
    useDrawer: (): Partial<DrawerProviderContext> => ({
        openTaskDrawer: jest.fn(),
    }),
}));

describe(ThisWeek.name, () => {
    it('default', async () => {
        const { getByTestId, queryByTestId } = render(
            <MockedProvider mocks={GetThisWeekDefaultMocks()} addTypename={false}>
                <ThisWeek accountListId="abc" />
            </MockedProvider>,
        );
        await waitFor(() => expect(queryByTestId('PartnerCarePrayerListLoading')).not.toBeInTheDocument());
        expect(getByTestId('PartnerCarePrayerList')).toBeInTheDocument();
        expect(getByTestId('TasksDueThisWeekList')).toBeInTheDocument();
        expect(getByTestId('LateCommitmentsListContacts')).toBeInTheDocument();
        expect(getByTestId('ReferralsTabRecentList')).toBeInTheDocument();
        expect(getByTestId('AppealsBoxName')).toBeInTheDocument();
    });

    it('loading', () => {
        const { getByTestId } = render(
            <MockedProvider mocks={GetThisWeekLoadingMocks()} addTypename={false}>
                <ThisWeek accountListId="abc" />
            </MockedProvider>,
        );
        expect(getByTestId('PartnerCarePrayerListLoading')).toBeInTheDocument();
        expect(getByTestId('TasksDueThisWeekListLoading')).toBeInTheDocument();
        expect(getByTestId('LateCommitmentsDivLoading')).toBeInTheDocument();
        expect(getByTestId('ReferralsTabRecentListLoading')).toBeInTheDocument();
    });

    it('empty', async () => {
        const { getByTestId, queryByTestId } = render(
            <MockedProvider mocks={GetThisWeekEmptyMocks()} addTypename={false}>
                <ThisWeek accountListId="abc" />
            </MockedProvider>,
        );
        await waitFor(() => expect(queryByTestId('PartnerCarePrayerListLoading')).not.toBeInTheDocument());
        expect(getByTestId('PartnerCarePrayerCardContentEmpty')).toBeInTheDocument();
        expect(getByTestId('TasksDueThisWeekCardContentEmpty')).toBeInTheDocument();
        expect(getByTestId('LateCommitmentsCardContentEmpty')).toBeInTheDocument();
        expect(getByTestId('ReferralsTabRecentCardContentEmpty')).toBeInTheDocument();
        expect(getByTestId('AppealsCardContentEmpty')).toBeInTheDocument();
    });
});
