import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import useTaskModal from '../../../../hooks/useTaskModal';
import theme from '../../../../theme';
import NullState from './NullState';

const openTaskModal = jest.fn();

jest.mock('src/hooks/useTaskModal');

interface TestComponentProps {
  page: 'contact' | 'task';
  totalCount: number;
  filtered: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  page,
  totalCount,
  filtered,
}) => (
  <TestRouter>
    <UrlFiltersProvider>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <NullState
              page={page}
              totalCount={totalCount}
              filtered={filtered}
            />
          </TestWrapper>
        </ThemeProvider>
      </SnackbarProvider>
    </UrlFiltersProvider>
  </TestRouter>
);

describe('NullState', () => {
  beforeEach(() => {
    (useTaskModal as jest.Mock).mockReturnValue({
      openTaskModal,
      preloadTaskModal: jest.fn(),
    });
  });

  it('render text for unfiltered null contact state', async () => {
    const { getByText, getByTestId, findByText } = render(
      <TestComponent page="contact" totalCount={0} filtered={false} />,
    );

    await waitFor(() =>
      expect(
        getByText(`Looks like you haven't added any contacts yet`),
      ).toBeInTheDocument(),
    );
    expect(
      getByText(
        'You can import contacts from another service or add a new contact.',
      ),
    ).toBeInTheDocument();
    expect(getByTestId('contact-null-state')).toBeInTheDocument();
    userEvent.click(getByText('Add new contact'));
    expect(await findByText('Save')).toBeInTheDocument();
  });

  it('render text filtered contacts', async () => {
    const { getByText } = render(
      <TestComponent page="contact" totalCount={10} filtered={true} />,
    );

    await waitFor(() =>
      expect(getByText(`You have 10 total contacts`)).toBeInTheDocument(),
    );
    expect(
      getByText(
        'Unfortunately none of them match your current search or filters.',
      ),
    ).toBeInTheDocument();
    userEvent.click(getByText('Reset All Search Filters'));
    userEvent.click(getByText('Add new contact'));
    expect(getByText('Save')).toBeInTheDocument();
  });

  it('render text for unfiltered null tasks state', async () => {
    const { getByText, getByTestId } = render(
      <TestComponent page="task" totalCount={0} filtered={false} />,
    );

    await waitFor(() =>
      expect(
        getByText(`Looks like you haven't added any tasks yet`),
      ).toBeInTheDocument(),
    );
    expect(
      getByText('You can import tasks from another service or add a new task.'),
    ).toBeInTheDocument();
    expect(getByTestId('task-null-state')).toBeInTheDocument();
    userEvent.click(getByText('Add new task'));
    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({ view: TaskModalEnum.Add }),
    );
  });

  it('render text filtered tasks', async () => {
    const { getByText } = render(
      <TestComponent page="task" totalCount={10} filtered={true} />,
    );

    await waitFor(() =>
      expect(getByText(`You have 10 total tasks`)).toBeInTheDocument(),
    );
    expect(
      getByText(
        'Unfortunately none of them match your current search or filters.',
      ),
    ).toBeInTheDocument();
    userEvent.click(getByText('Reset All Search Filters'));
    userEvent.click(getByText('Add new task'));
    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({ view: TaskModalEnum.Add }),
    );
  });
});
