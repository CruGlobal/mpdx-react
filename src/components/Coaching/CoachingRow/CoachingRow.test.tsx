import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  CoachedPersonFragment,
  CoachedPersonFragmentDoc,
} from '../LoadCoachingList.generated';
import { CoachingRow } from './CoachingRow';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => {
  const coachingAccount = gqlMock<CoachedPersonFragment>(
    CoachedPersonFragmentDoc,
    {
      mocks: {
        id: 'coaching-account',
        name: 'John Doe Account',
        currency: 'USD',
        primaryAppeal: null,
        balance: 100,
        users: {
          nodes: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Sally', lastName: 'Doe' },
          ],
        },
      },
    },
  );

  return (
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <CoachingRow
            accountListId={accountListId}
            coachingAccount={coachingAccount}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  );
};

describe('CoachingRow', () => {
  it('renders', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'John Doe Account' }),
    ).toBeInTheDocument();
    expect(getByText('John Doe, Sally Doe')).toBeInTheDocument();
    expect(getByText('Balance: $100')).toBeInTheDocument();
  });

  it('deletes coaching account list', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button'));
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('DeleteCoachingAccountList', {
        accountListId: 'coaching-account',
        coachId: 'user-1',
      });
    });
  });
});
