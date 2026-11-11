import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { AddMpdCoachModal } from './AddMpdCoachModal';
import {
  AddNewStaffMpdCoachMutation,
  NewStaffMpdCoachCandidatesQuery,
} from './MpdCoaches.generated';

const mutationSpy = jest.fn();
const handleClose = jest.fn();

type Mocks = {
  NewStaffMpdCoachCandidates: NewStaffMpdCoachCandidatesQuery;
  AddNewStaffMpdCoach: AddNewStaffMpdCoachMutation;
};

const candidatesMock = {
  newStaffMpdCoachCandidates: [
    {
      id: 'hcm-1',
      userId: 'user-1',
      firstName: 'Dana',
      lastName: 'Reed',
      personNumber: '000123',
      department: 'Campus Ministry',
      email: 'dana@example.com',
      listed: false,
    },
    {
      id: 'hcm-2',
      userId: 'user-2',
      firstName: 'Dana',
      lastName: 'Reed',
      personNumber: '000456',
      department: 'City',
      email: null,
      listed: true,
    },
  ],
};

const renderModal = (mocks: ApolloErgonoMockMap = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<Mocks>
          mocks={
            {
              NewStaffMpdCoachCandidates: candidatesMock,
              ...mocks,
            } as ApolloErgonoMockMap
          }
          onCall={mutationSpy}
        >
          <AddMpdCoachModal handleClose={handleClose} />
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

const searchFor = async (
  utils: ReturnType<typeof renderModal>,
  term: string,
) => {
  userEvent.type(utils.getByRole('combobox', { name: 'Search' }), term);
  await waitFor(() =>
    expect(mutationSpy).toHaveGraphqlOperation('NewStaffMpdCoachCandidates', {
      search: term,
    }),
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AddMpdCoachModal', () => {
  it('asks for a name before searching', () => {
    const { getByRole, getByText } = renderModal();

    userEvent.click(getByRole('combobox', { name: 'Search' }));

    expect(
      getByText('Type a name or person number to search'),
    ).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation(
      'NewStaffMpdCoachCandidates',
    );
  });

  it('tells apart two people with the same name by department and person number', async () => {
    const utils = renderModal();
    await searchFor(utils, 'dana');

    expect(
      await utils.findByRole('option', { name: /Campus Ministry · 000123/ }),
    ).toBeInTheDocument();
    expect(
      utils.getByRole('option', { name: /City · 000456/ }),
    ).toBeInTheDocument();
  });

  it('marks someone already on the list and keeps them from being picked', async () => {
    const utils = renderModal();
    await searchFor(utils, 'dana');

    const listed = await utils.findByRole('option', { name: /000456/ });
    expect(listed).toHaveTextContent('Already added');
    expect(listed).toHaveAttribute('aria-disabled', 'true');
  });

  it('explains why someone cannot be found', async () => {
    const utils = renderModal({
      NewStaffMpdCoachCandidates: { newStaffMpdCoachCandidates: [] },
    });
    await searchFor(utils, 'nobody');

    expect(
      await utils.findByText(
        'No one found. A coach has to sign in to MPDX once before they can be added.',
      ),
    ).toBeInTheDocument();
  });

  it('keeps Save disabled until someone is picked', () => {
    const { getByRole } = renderModal();

    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('adds the picked person and closes', async () => {
    const utils = renderModal();
    await searchFor(utils, 'dana');

    userEvent.click(
      await utils.findByRole('option', { name: /Campus Ministry · 000123/ }),
    );
    userEvent.click(utils.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddNewStaffMpdCoach', {
        userId: 'user-1',
      }),
    );
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });

  it('stays open with an error when adding fails', async () => {
    const utils = renderModal({
      AddNewStaffMpdCoach: {
        addNewStaffMpdCoach: () => {
          throw new Error('Add failed');
        },
      },
    });
    await searchFor(utils, 'dana');

    userEvent.click(
      await utils.findByRole('option', { name: /Campus Ministry · 000123/ }),
    );
    userEvent.click(utils.getByRole('button', { name: 'Save' }));

    expect(
      await utils.findByText('The coach could not be added. Please try again.'),
    ).toBeInTheDocument();
    expect(handleClose).not.toHaveBeenCalled();
  });
});
