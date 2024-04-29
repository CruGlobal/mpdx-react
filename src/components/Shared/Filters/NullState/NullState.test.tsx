import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestWrapper from '__tests__/util/TestWrapper';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import useTaskModal from '../../../../hooks/useTaskModal';
import theme from '../../../../theme';
import NullState from './NullState';

const changeFilters = jest.fn();
const openTaskModal = jest.fn();

jest.mock('src/hooks/useTaskModal');

describe('NullState', () => {
  beforeEach(() => {
    (useTaskModal as jest.Mock).mockReturnValue({
      openTaskModal,
      preloadTaskModal: jest.fn(),
    });
  });

  it('render text for unfiltered null contact state', async () => {
    const { getByText, getByTestId, findByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <NullState
              page="contact"
              totalCount={0}
              filtered={false}
              changeFilters={changeFilters}
            />
          </TestWrapper>
        </ThemeProvider>
      </SnackbarProvider>,
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
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <NullState
              page="contact"
              totalCount={10}
              filtered={true}
              changeFilters={changeFilters}
            />
          </TestWrapper>
        </ThemeProvider>
      </SnackbarProvider>,
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
    expect(changeFilters).toHaveBeenCalled();
    userEvent.click(getByText('Add new contact'));
    expect(getByText('Save')).toBeInTheDocument();
  });

  it('render text for unfiltered null tasks state', async () => {
    const { getByText, getByTestId } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <NullState
              page="task"
              totalCount={0}
              filtered={false}
              changeFilters={changeFilters}
            />
          </TestWrapper>
        </ThemeProvider>
      </SnackbarProvider>,
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
      expect(openTaskModal).toHaveBeenCalledWith({ view: 'add' }),
    );
  });

  it('render text filtered tasks', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <NullState
              page="task"
              totalCount={10}
              filtered={true}
              changeFilters={changeFilters}
            />
          </TestWrapper>
        </ThemeProvider>
      </SnackbarProvider>,
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
    expect(changeFilters).toHaveBeenCalled();
    userEvent.click(getByText('Add new task'));
    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({ view: 'add' }),
    );
  });
});
