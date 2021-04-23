import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useApp } from '../../App';
import TaskStatus from '.';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';

jest.mock('../../App', () => ({
  useApp: jest.fn(),
}));

const openTaskDrawer = jest.fn();

beforeEach(() => {
  (useApp as jest.Mock).mockReturnValue({
    openTaskDrawer,
  });
});

describe('TaskStatus', () => {
  it('default', async () => {
    const { getByRole, findByText } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus />
      </ThemeProvider>,
    );
    userEvent.hover(getByRole('button'));
    expect(await findByText('No Due Date')).toBeInTheDocument();
  });

  it('completedAt', async () => {
    const { getByRole, findByText } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus completedAt="2009-12-31T11:00:00.000Z" />
      </ThemeProvider>,
    );
    userEvent.hover(getByRole('button'));
    expect(await findByText('Completed 10 years ago')).toBeInTheDocument();
  });

  it('startAt in past', async () => {
    const { getByRole, findByText } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus startAt="2009-12-31T11:00:00.000Z" />
      </ThemeProvider>,
    );
    userEvent.hover(getByRole('button'));
    expect(await findByText('Overdue 10 years ago')).toBeInTheDocument();
  });

  it('startAt in future', async () => {
    const { getByRole, findByText } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus startAt="2050-12-31T11:00:00.000Z" />
      </ThemeProvider>,
    );
    userEvent.hover(getByRole('button'));
    expect(await findByText('Due in 30 years')).toBeInTheDocument();
  });

  it('taskId', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus taskId="task-1" />
      </ThemeProvider>,
    );
    userEvent.click(getByRole('button'));
    expect(openTaskDrawer).toHaveBeenCalledWith({
      taskId: 'task-1',
      showCompleteForm: true,
    });
  });
});
