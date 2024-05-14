import { render } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import TestRouter from '__tests__/util/TestRouter';
import { setDataDogUser } from 'src/lib/dataDog';
import DataDog from './DataDog';

jest.mock('src/lib/dataDog');

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
  isReady: true,
};

const TestComponent: React.FC = () => (
  <TestRouter router={router}>
    <DataDog />
  </TestRouter>
);

describe('DataDog', () => {
  it('calls setDataDogUser with the user', () => {
    render(<TestComponent />);

    expect(setDataDogUser).toHaveBeenCalledWith({
      accountListId: 'account-list-1',
      email: 'first.last@cru.org',
      name: 'First Last',
      userId: 'user-1',
    });
  });

  it('does not call setDataDogUser if there is no session', () => {
    (useSession as jest.MockedFn<typeof useSession>).mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
      update: () => Promise.resolve(null),
    });

    render(<TestComponent />);

    expect(setDataDogUser).not.toHaveBeenCalled();
  });

  it('handles missing accountListId', () => {
    render(
      <TestRouter router={{ query: {}, isReady: true }}>
        <DataDog />
      </TestRouter>,
    );

    expect(setDataDogUser).toHaveBeenCalledWith({
      accountListId: null,
      email: 'first.last@cru.org',
      name: 'First Last',
      userId: 'user-1',
    });
  });
});
