import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../tests/testingLibraryReactMock';
import { ActivityTypeEnum } from '../../../../../types/globalTypes';
import { AppProviderContext } from '../../../App/Provider';
import TasksDueThisWeek from '.';

const openTaskDrawer = jest.fn();

jest.mock('../../../App', () => ({
    useApp: (): Partial<AppProviderContext> => ({
        openTaskDrawer,
    }),
}));

describe(TasksDueThisWeek.name, () => {
    beforeEach(() => {
        openTaskDrawer.mockClear();
    });

    it('default', () => {
        const { getByTestId, queryByTestId } = render(<TasksDueThisWeek />);
        expect(getByTestId('TasksDueThisWeekCardContentEmpty')).toBeInTheDocument();
        expect(queryByTestId('TasksDueThisWeekList')).not.toBeInTheDocument();
        expect(queryByTestId('TasksDueThisWeekListLoading')).not.toBeInTheDocument();
    });

    it('loading', () => {
        const { getByTestId, queryByTestId } = render(<TasksDueThisWeek loading />);
        expect(getByTestId('TasksDueThisWeekListLoading')).toBeInTheDocument();
        expect(queryByTestId('TasksDueThisWeekList')).not.toBeInTheDocument();
        expect(queryByTestId('TasksDueThisWeekCardContentEmpty')).not.toBeInTheDocument();
    });

    it('empty', () => {
        const dueTasks = {
            nodes: [],
            totalCount: 0,
        };
        const { getByTestId, queryByTestId } = render(<TasksDueThisWeek dueTasks={dueTasks} />);
        expect(getByTestId('TasksDueThisWeekCardContentEmpty')).toBeInTheDocument();
        expect(queryByTestId('TasksDueThisWeekList')).not.toBeInTheDocument();
        expect(queryByTestId('TasksDueThisWeekListLoading')).not.toBeInTheDocument();
    });

    it('props', () => {
        const dueTasks = {
            nodes: [
                {
                    id: 'task_1',
                    subject: 'the quick brown fox jumps over the lazy dog',
                    activityType: ActivityTypeEnum.PRAYER_REQUEST,
                    contacts: { nodes: [{ name: 'Smith, Roger' }] },
                },
                {
                    id: 'task_2',
                    subject: 'the quick brown fox jumps over the lazy dog',
                    activityType: ActivityTypeEnum.APPOINTMENT,
                    contacts: { nodes: [{ name: 'Smith, Sarah' }] },
                },
            ],
            totalCount: 1234,
        };
        const { getByTestId, queryByTestId } = render(<TasksDueThisWeek dueTasks={dueTasks} />);
        expect(getByTestId('TasksDueThisWeekList')).toBeInTheDocument();
        expect(queryByTestId('TasksDueThisWeekCardContentEmpty')).not.toBeInTheDocument();
        expect(queryByTestId('TasksDueThisWeekListLoading')).not.toBeInTheDocument();
        expect(getByTestId('TasksDueThisWeekButtonViewAll').textContent).toEqual('View All (1,234)');
        const task1Element = getByTestId('TasksDueThisWeekListItem-task_1');
        expect(task1Element.textContent).toEqual(
            'Smith, RogerPrayer Request — the quick brown fox jumps over the lazy dog',
        );
        userEvent.click(task1Element);
        expect(openTaskDrawer).toHaveBeenCalledWith({ taskId: 'task_1' });
        expect(getByTestId('TasksDueThisWeekListItem-task_2').textContent).toEqual(
            'Smith, SarahAppointment — the quick brown fox jumps over the lazy dog',
        );
    });
});
