import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import Connect from './connect.page';

const push = jest.fn();
const router = {
  push,
};

describe('Setup connect page', () => {
  it('renders', async () => {
    const mutationSpy = jest.fn();
    const { findByRole } = render(
      <TestRouter router={router}>
        <SnackbarProvider>
          <GqlMockedProvider onCall={mutationSpy}>
            <Connect />
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>,
    );

    expect(
      await findByRole('heading', { name: "It's time for awesome!" }),
    ).toBeInTheDocument();
  });
});
