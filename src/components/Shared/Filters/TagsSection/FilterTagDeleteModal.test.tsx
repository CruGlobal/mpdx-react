import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../../../theme';
import { FilterTagDeleteModal } from './FilterTagDeleteModal';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { DeleteTagMutation } from './Chip/DeleteTag.generated';
import { SnackbarProvider } from 'notistack';

const handleClose = jest.fn();

const accountListId = '123';

const router = {
  pathName: `/accountLists/${accountListId}/tasks/`,
  route: `/accountLists/${accountListId}/tasks/`,
  query: { accountListId },
  isReady: true,
};

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

describe('FilterTagDeleteModal', () => {
  it('default', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<DeleteTagMutation>>
            <ThemeProvider theme={theme}>
              <FilterTagDeleteModal
                isOpen={true}
                onClose={handleClose}
                tagName={'test'}
              />
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    expect(
      getByText(
        'Are you sure you want to completely delete this tag ({{tagName}}) and remove it from all tasks?',
      ),
    ).toBeInTheDocument();
  });

  it('handle close', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<DeleteTagMutation>>
            <ThemeProvider theme={theme}>
              <FilterTagDeleteModal
                isOpen={true}
                onClose={handleClose}
                tagName={'test'}
              />
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    userEvent.click(getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });

  //TODO: fails because of refetch query (line 38 in FilterTagDeleteModal)
  it.skip('handle clicking delete', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<DeleteTagMutation>
            mocks={{
              deleteTags: {
                id: '123',
              },
            }}
            onCall={mutationSpy}
          >
            <ThemeProvider theme={theme}>
              <FilterTagDeleteModal
                isOpen={true}
                onClose={handleClose}
                tagName={'test'}
              />
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    const deleteButton = getByRole('button', { name: 'Delete Tag' });
    userEvent.click(deleteButton);

    await waitFor(() => expect(deleteButton).toBeDisabled());
    await waitFor(() => expect(handleClose).toHaveBeenCalledTimes(0));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Tag deleted!', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.page).toEqual('tasks');
    expect(operation.variables.tagName).toEqual('test');
  });
});
