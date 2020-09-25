import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import MockDate from 'mockdate';
import { GetWeeklyActivityQueryDefaultMocks, GetWeeklyActivityQueryLoadingMocks } from './WeeklyActivity.mock';
import WeeklyActivity from '.';

describe('WeeklyActivity', () => {
    it('loading', () => {
        const { getByTestId } = render(
            <MockedProvider mocks={GetWeeklyActivityQueryLoadingMocks()} addTypename={false}>
                <WeeklyActivity accountListId="abc" />
            </MockedProvider>,
        );
        expect(getByTestId('WeeklyActivityTableCellCompletedCalls').children[0].className).toContain(
            'MuiSkeleton-root',
        );
        expect(getByTestId('WeeklyActivityTableCellCallsThatProducedAppointments').children[0].className).toContain(
            'MuiSkeleton-root',
        );
        expect(getByTestId('WeeklyActivityTableCellCompletedMessages').children[0].className).toContain(
            'MuiSkeleton-root',
        );
        expect(getByTestId('WeeklyActivityTableCellMessagesThatProducedAppointments').children[0].className).toContain(
            'MuiSkeleton-root',
        );
        expect(getByTestId('WeeklyActivityTableCellCompletedAppointments').children[0].className).toContain(
            'MuiSkeleton-root',
        );
        expect(getByTestId('WeeklyActivityTableCellCompletedCorrespondence').children[0].className).toContain(
            'MuiSkeleton-root',
        );
    });

    describe('MockDate', () => {
        beforeEach(() => {
            MockDate.set(new Date(2020, 1, 1));
        });

        afterEach(() => {
            MockDate.reset();
        });

        it('default', async () => {
            const { getByTestId, queryByTestId } = render(
                <MockedProvider mocks={GetWeeklyActivityQueryDefaultMocks()} addTypename={false}>
                    <WeeklyActivity accountListId="abc" />
                </MockedProvider>,
            );
            expect(getByTestId('WeeklyActivityTableCellDateRange').textContent).toEqual('Jan 26 - Feb 1');
            await waitFor(() => expect(queryByTestId('WeeklyActivitySkeletonLoading')).not.toBeInTheDocument());
            expect(getByTestId('WeeklyActivityTableCellCompletedCalls').textContent).toEqual('1,234');
            expect(getByTestId('WeeklyActivityTableCellCallsThatProducedAppointments').textContent).toEqual('5,678');
            expect(getByTestId('WeeklyActivityTableCellCompletedMessages').textContent).toEqual('9,012');
            expect(getByTestId('WeeklyActivityTableCellMessagesThatProducedAppointments').textContent).toEqual('3,456');
            expect(getByTestId('WeeklyActivityTableCellCompletedAppointments').textContent).toEqual('7,890');
            expect(getByTestId('WeeklyActivityTableCellCompletedCorrespondence').textContent).toEqual('1,234');
            fireEvent.click(getByTestId('WeeklyActivityIconButtonSubtractWeek'));
            await waitFor(() => expect(queryByTestId('WeeklyActivitySkeletonLoading')).not.toBeInTheDocument());
            expect(getByTestId('WeeklyActivityTableCellDateRange').textContent).toEqual('Jan 19 - Jan 25');
            expect(getByTestId('WeeklyActivityTableCellCompletedCalls').textContent).toEqual('5,678');
            fireEvent.click(getByTestId('WeeklyActivityIconButtonAddWeek'));
            await waitFor(() => expect(queryByTestId('WeeklyActivitySkeletonLoading')).not.toBeInTheDocument());
            expect(getByTestId('WeeklyActivityTableCellDateRange').textContent).toEqual('Jan 26 - Feb 1');
            expect(getByTestId('WeeklyActivityTableCellCompletedCalls').textContent).toEqual('1,234');
        });
    });
});
