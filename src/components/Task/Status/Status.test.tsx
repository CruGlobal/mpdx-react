import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { AppProviderContext } from '../../App/Provider';
import TaskStatus from '.';

const openTaskDrawer = jest.fn();

jest.mock('../../App', () => ({
    useApp: (): Partial<AppProviderContext> => ({
        openTaskDrawer,
    }),
}));

describe('TaskStatus', () => {
    beforeEach(() => {
        openTaskDrawer.mockClear();
        MockDate.set(new Date(2020, 1, 1));
    });

    afterEach(() => {
        MockDate.reset();
    });

    it('default', async () => {
        const { getByRole, findByText } = render(<TaskStatus />);
        userEvent.hover(getByRole('button'));
        expect(await findByText('No Due Date')).toBeInTheDocument();
    });

    it('completedAt', async () => {
        const { getByRole, findByText } = render(<TaskStatus completedAt="2009-12-31T11:00:00.000Z" />);
        userEvent.hover(getByRole('button'));
        expect(await findByText('Completed about 10 years ago')).toBeInTheDocument();
    });

    it('startAt in past', async () => {
        const { getByRole, findByText } = render(<TaskStatus startAt="2009-12-31T11:00:00.000Z" />);
        userEvent.hover(getByRole('button'));
        expect(await findByText('Overdue about 10 years ago')).toBeInTheDocument();
    });

    it('startAt in future', async () => {
        const { getByRole, findByText } = render(<TaskStatus startAt="2050-12-31T11:00:00.000Z" />);
        userEvent.hover(getByRole('button'));
        expect(await findByText('Due in in almost 31 years')).toBeInTheDocument();
    });

    it('taskId', async () => {
        const { getByRole } = render(<TaskStatus taskId="task-1" />);
        userEvent.click(getByRole('button'));
        expect(openTaskDrawer).toHaveBeenCalledWith({ taskId: 'task-1', showCompleteForm: true });
    });
});
