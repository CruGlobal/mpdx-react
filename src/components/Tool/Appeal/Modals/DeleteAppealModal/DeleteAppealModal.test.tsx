import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { DeleteAppealModal } from './DeleteAppealModal';

const mockEnqueue = jest.fn();
const handleClose = jest.fn();
const mutationSpy = jest.fn();
const routerPush = jest.fn().mockResolvedValue(true);

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

const accountListId = 'abc';
const appealId = 'appealId';
const router = {
  query: { accountListId },
  isReady: true,
  push: routerPush,
};

const Components = ({ mocks }: { mocks?: ApolloErgonoMockMap }) => (
  <SnackbarProvider>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider mocks={mocks} onCall={mutationSpy}>
            <AppealsContext.Provider
              value={
                {
                  accountListId,
                  appealId: appealId,
                } as AppealsType
              }
            >
              <DeleteAppealModal handleClose={handleClose} />
            </AppealsContext.Provider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </DndProvider>
  </SnackbarProvider>
);

describe('DeleteAppealModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
  });
  it('default', () => {
    const { getByRole, getByText } = render(<Components />);

    expect(getByRole('heading', { name: 'Delete Appeal' })).toBeInTheDocument();
    expect(
      getByText(/you are about to permanently delete this appeal/i),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Delete Appeal' })).toBeInTheDocument();
  });

  it('should close modal', () => {
    const { getByRole } = render(<Components />);

    expect(handleClose).toHaveBeenCalledTimes(0);
    userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should delete appeal and redirect back to the main appeals page', async () => {
    const { getByRole } = render(<Components />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    userEvent.click(getByRole('button', { name: 'Delete Appeal' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Successfully deleted appeal.', {
        variant: 'success',
      }),
    );

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('DeleteAppeal', {
        input: {
          accountListId,
          id: appealId,
        },
      });
    });

    expect(routerPush).toHaveBeenCalledWith(
      `/accountLists/${accountListId}/tools/appeals`,
    );
  });

  it('redirects back to the main appeals page when the appeal was already deleted', async () => {
    const { getByRole } = render(
      <Components
        mocks={{
          DeleteAppeal: {
            deleteAppeal: () => {
              throw new GraphQLError('Appeal with id=appealId not found', {
                extensions: { code: 'NOT_FOUND' },
              });
            },
          },
        }}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Delete Appeal' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'That appeal could not be found. It may have already been deleted.',
        { variant: 'error' },
      ),
    );
    expect(routerPush).toHaveBeenCalledWith(
      `/accountLists/${accountListId}/tools/appeals`,
    );
    expect(mutationSpy.mock.calls[0][0].operation.getContext()).toMatchObject({
      suppressErrorCodes: ['NOT_FOUND'],
    });
  });

  it('stays on the page when the delete fails for another reason', async () => {
    const { getByRole } = render(
      <Components
        mocks={{
          DeleteAppeal: {
            deleteAppeal: () => {
              throw new GraphQLError('Internal server error', {
                extensions: { code: 'INTERNAL_SERVER_ERROR' },
              });
            },
          },
        }}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Delete Appeal' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'There was an error trying to delete the appeal.',
        { variant: 'error' },
      ),
    );
    expect(routerPush).not.toHaveBeenCalled();
  });
});
