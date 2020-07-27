import React from 'react';
import { render } from '@testing-library/react';
import { ActivityTypeEnum } from '../../../../../types/globalTypes';
import TasksDueThisWeek from '.';

describe(TasksDueThisWeek.name, () => {
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
        expect(getByTestId('TasksDueThisWeekListItem-task_1').textContent).toEqual(
            'Smith, RogerPRAYER_REQUEST — the quick brown fox jumps over the lazy dog',
        );
        expect(getByTestId('TasksDueThisWeekListItem-task_2').textContent).toEqual(
            'Smith, SarahAPPOINTMENT — the quick brown fox jumps over the lazy dog',
        );
    });
});
