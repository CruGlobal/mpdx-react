import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdCoaches } from './MpdCoaches';
import {
  NewStaffMpdCoachesQuery,
  RemoveNewStaffMpdCoachMutation,
} from './MpdCoaches.generated';

const mutationSpy = jest.fn();

type Mocks = {
  NewStaffMpdCoaches: NewStaffMpdCoachesQuery;
  RemoveNewStaffMpdCoach: RemoveNewStaffMpdCoachMutation;
};

const coachesMock = {
  newStaffMpdCoaches: [
    {
      id: 'coach-row-1',
      userId: 'user-1',
      firstName: 'Dana',
      lastName: 'Reed',
      email: 'dana@example.com',
      addedByName: 'Marc Admin',
      createdAt: '2026-11-02T15:00:00Z',
    },
    {
      id: 'coach-row-2',
      userId: 'user-2',
      firstName: 'Lee',
      lastName: 'Park',
      email: null,
      addedByName: null,
      createdAt: '2026-11-03T15:00:00Z',
    },
  ],
};

const renderCoaches = (mocks: ApolloErgonoMockMap = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<Mocks>
          mocks={
            { NewStaffMpdCoaches: coachesMock, ...mocks } as ApolloErgonoMockMap
          }
          onCall={mutationSpy}
        >
          <MpdCoaches />
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

describe('MpdCoaches', () => {
  it('lists each coach with their email, who added them and when', async () => {
    const { findByRole } = renderCoaches();

    const row = await findByRole('row', { name: /Dana Reed/ });
    expect(within(row).getByText('dana@example.com')).toBeInTheDocument();
    expect(within(row).getByText('Marc Admin')).toBeInTheDocument();
    expect(within(row).getByText('11/2/2026')).toBeInTheDocument();
  });

  it('shows a dash for a missing email or adder', async () => {
    const { findByRole } = renderCoaches();

    const row = await findByRole('row', { name: /Lee Park/ });
    expect(within(row).getAllByText('—')).toHaveLength(2);
  });

  it('explains the empty list', async () => {
    const { findByText, queryByRole } = renderCoaches({
      NewStaffMpdCoaches: { newStaffMpdCoaches: [] },
    });

    expect(
      await findByText(
        'No MPD coaches have been added yet. Add a coach so they can be assigned to new staff.',
      ),
    ).toBeInTheDocument();
    expect(queryByRole('table')).not.toBeInTheDocument();
  });

  it('surfaces a failed list instead of calling it empty', async () => {
    const { findByRole, queryByText } = renderCoaches({
      NewStaffMpdCoaches: {
        newStaffMpdCoaches: () => {
          throw new Error('Not authorized');
        },
      },
    });

    expect(await findByRole('alert')).toHaveTextContent('Not authorized');
    expect(queryByText(/have been added yet/)).not.toBeInTheDocument();
  });

  it('removes a coach after confirmation and drops their row', async () => {
    const { findByRole, getByRole, queryByRole, getByTestId } = renderCoaches();

    userEvent.click(await findByRole('button', { name: 'Remove Dana Reed' }));
    expect(getByTestId('confirmModalMessage')).toHaveTextContent(
      'Remove Dana Reed from the MPD coach list? Staff they already coach keep them as their coach.',
    );
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('RemoveNewStaffMpdCoach', {
        id: 'coach-row-1',
      }),
    );
    await waitFor(() =>
      expect(queryByRole('row', { name: /Dana Reed/ })).not.toBeInTheDocument(),
    );
    // findBy retries until the confirmation dialog's aria-hidden lifts.
    expect(await findByRole('row', { name: /Lee Park/ })).toBeInTheDocument();
  });

  it('keeps the row when removing fails', async () => {
    const { findByRole, getByRole } = renderCoaches({
      RemoveNewStaffMpdCoach: {
        removeNewStaffMpdCoach: () => {
          throw new Error('Remove failed');
        },
      },
    });

    userEvent.click(await findByRole('button', { name: 'Remove Dana Reed' }));
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('RemoveNewStaffMpdCoach'),
    );
    expect(await findByRole('row', { name: /Dana Reed/ })).toBeInTheDocument();
  });

  it('removes nobody when the confirmation is declined', async () => {
    const { findByRole, getByRole } = renderCoaches();

    userEvent.click(await findByRole('button', { name: 'Remove Dana Reed' }));
    userEvent.click(getByRole('button', { name: 'No' }));

    expect(mutationSpy).not.toHaveGraphqlOperation('RemoveNewStaffMpdCoach');
    expect(await findByRole('row', { name: /Dana Reed/ })).toBeInTheDocument();
  });

  it('opens the add coach search', async () => {
    const { findByRole } = renderCoaches();

    userEvent.click(await findByRole('button', { name: 'Add Coach' }));

    expect(
      await findByRole('dialog', { name: 'Add MPD Coach' }),
    ).toBeInTheDocument();
  });
});
