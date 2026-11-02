import { ObservableQuery, ServerError, useQuery } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, render } from '@testing-library/react';
import { GetDefaultAccountDocument } from 'pages/api/getDefaultAccount.generated';
import { RefetchOnReconnect } from './RefetchOnReconnect';

const request = { query: GetDefaultAccountDocument };
const data = {
  user: { __typename: 'User', id: 'user-1', defaultAccountList: 'list-1' },
  accountLists: { __typename: 'AccountListConnection', nodes: [] },
};

const serverError: ServerError = Object.assign(new Error('Server error'), {
  name: 'ServerError' as const,
  response: new Response(),
  result: {},
  statusCode: 500,
});

const TestQuery: React.FC = () => {
  const { data, error } = useQuery(GetDefaultAccountDocument);
  if (error) {
    return <div>Failed</div>;
  }
  return data ? <div>{data.user.defaultAccountList}</div> : null;
};

const TestComponent: React.FC<{ mocks: MockedResponse[] }> = ({ mocks }) => (
  <MockedProvider mocks={mocks}>
    <>
      <RefetchOnReconnect />
      <TestQuery />
    </>
  </MockedProvider>
);

const goOnline = () => {
  act(() => {
    window.dispatchEvent(new Event('online'));
  });
};

describe('RefetchOnReconnect', () => {
  const refetch = jest.spyOn(ObservableQuery.prototype, 'refetch');

  it('refetches a query that failed because the user was offline', async () => {
    const { findByText } = render(
      <TestComponent
        mocks={[
          { request, error: new TypeError('Failed to fetch') },
          { request, result: { data } },
        ]}
      />,
    );

    expect(await findByText('Failed')).toBeInTheDocument();
    goOnline();
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(await findByText('list-1')).toBeInTheDocument();
  });

  it('does not refetch a query that failed with a server error', async () => {
    const { findByText } = render(
      <TestComponent mocks={[{ request, error: serverError }]} />,
    );

    expect(await findByText('Failed')).toBeInTheDocument();
    goOnline();
    expect(refetch).not.toHaveBeenCalled();
  });

  it('does not refetch a query that loaded', async () => {
    const { findByText } = render(
      <TestComponent mocks={[{ request, result: { data } }]} />,
    );

    expect(await findByText('list-1')).toBeInTheDocument();
    goOnline();
    expect(refetch).not.toHaveBeenCalled();
  });
});
