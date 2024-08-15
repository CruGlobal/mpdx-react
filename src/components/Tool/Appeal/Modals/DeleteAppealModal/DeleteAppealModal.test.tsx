import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
const routerPush = jest.fn();

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

const Components = () => (
  <SnackbarProvider>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider onCall={mutationSpy}>
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
      expect(mutationSpy.mock.lastCall[0].operation.operationName).toEqual(
        'DeleteAppeal',
      );
      expect(mutationSpy.mock.lastCall[0].operation.variables).toEqual({
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
});
