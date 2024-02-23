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

jest.mock('src/hooks/useUser.tsx', () => ({
  useUser: jest.fn().mockReturnValue({
    id: 'user-1',
  }),
}));

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
        name: 'John Doe',
        currency: 'USD',
        primaryAppeal: null,
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
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'John Doe' })).toBeInTheDocument();
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
