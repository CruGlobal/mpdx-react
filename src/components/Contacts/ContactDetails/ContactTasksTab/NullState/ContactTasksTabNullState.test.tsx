import { ThemeProvider } from '@mui/material';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import {
  render,
  waitFor,
} from '../../../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../../../__tests__/util/TestWrapper';
import theme from '../../../../../theme';
import useTaskModal from '../../../../../../src/hooks/useTaskModal';
import { ContactTasksTabNullState } from './ContactTasksTabNullState';

const contactId = 'abc';
const openTaskModal = jest.fn();

jest.mock('../../../../../../src/hooks/useTaskModal');

describe('ContactTasksTabNullState', () => {
  beforeEach(() => {
    (useTaskModal as jest.Mock).mockReturnValue({
      openTaskModal,
    });
  });

  it('renders text for and opens the task modal', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <ContactTasksTabNullState contactId={contactId} />
          </TestWrapper>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(
        getByText('No tasks can be found for this contact'),
      ).toBeInTheDocument(),
    );
    expect(
      getByText('Try adding a task or changing your search filters.'),
    ).toBeInTheDocument();
    userEvent.click(getByText('Add New Task'));
    expect(openTaskModal).toHaveBeenCalledWith({
      defaultValues: { contactIds: [contactId] },
    });
  });
});
