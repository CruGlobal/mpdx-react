import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import {
  render,
  waitFor,
} from '../../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../../__tests__/util/TestWrapper';
import theme from '../../../../theme';
import useTaskDrawer from '../../../../../src/hooks/useTaskDrawer';
import NullState from './NullState';

const changeFilters = jest.fn();
const openTaskDrawer = jest.fn();

jest.mock('../../../../../src/hooks/useTaskDrawer');

describe('NullState', () => {
  beforeEach(() => {
    (useTaskDrawer as jest.Mock).mockReturnValue({
      openTaskDrawer,
    });
  });

  it('render text for unfiltered null contact state', async () => {
    const { getByText } = render(
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
    userEvent.click(getByText('Add new contact'));
    expect(getByText('Save')).toBeInTheDocument();
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
    const { getByText } = render(
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
    userEvent.click(getByText('Add new task'));
    await waitFor(() => expect(openTaskDrawer).toHaveBeenCalledWith({}));
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
    await waitFor(() => expect(openTaskDrawer).toHaveBeenCalledWith({}));
  });
});
