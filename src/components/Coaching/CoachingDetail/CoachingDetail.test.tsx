import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import {
  LoadCoachingDetailQuery,
  useGetAccountListUsersQuery,
  useGetAccountListCoachUsersQuery,
} from './LoadCoachingDetail.generated';
import { CoachingDetail } from './CoachingDetail';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import TestRouter from '__tests__/util/TestRouter';
import {
  beforeTestResizeObserver,
  afterTestResizeObserver,
} from 'src/utils/tests/windowResizeObserver';

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

const coachingId = 'coaching-id';
describe('LoadCoachingDetail', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });
  it('view', async () => {
    const { findByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
          mocks={{
            LoadCoachingDetail: {
              coachingAccountList: {
                id: coachingId,
                name: 'John Doe',
                currency: 'USD',
                monthlyGoal: 55,
              },
            },
          }}
        >
          <CoachingDetail coachingId="coaching-id" isAccountListId={false} />
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $55')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });
  it('null goal', async () => {
    const { findByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
          mocks={{
            LoadCoachingDetail: {
              coachingAccountList: {
                id: coachingId,
                name: 'John Doe',
                currency: 'USD',
                monthlyGoal: null,
              },
            },
          }}
        >
          <CoachingDetail coachingId="coaching-id" isAccountListId={false} />
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $0')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });

  it('view isAccountList', async () => {
    const { findByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
          mocks={{
            LoadAccountListCoachingDetail: {
              accountList: {
                id: coachingId,
                name: 'John Doe',
                currency: 'USD',
                monthlyGoal: 55,
              },
            },
          }}
        >
          <CoachingDetail coachingId="coaching-id" isAccountListId={true} />
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $55')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });
  it('null goal isAccountList', async () => {
    const { findByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
          mocks={{
            LoadAccountListCoachingDetail: {
              accountList: {
                id: coachingId,
                name: 'John Doe',
                currency: 'USD',
                monthlyGoal: null,
              },
            },
          }}
        >
          <CoachingDetail coachingId="coaching-id" isAccountListId={true} />
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $0')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });
  it('query Users', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useGetAccountListCoachUsersQuery({
          variables: { accountListId: 'account-list-id' },
        }),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();
    expect(
      result.current.data?.getAccountListCoachUsers?.length,
    ).toMatchInlineSnapshot(`2`);
  });
  it('query Coach Users', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useGetAccountListUsersQuery({
          variables: { accountListId: 'account-list-id' },
        }),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();
    expect(
      result.current.data?.accountListUsers.nodes.length,
    ).toMatchInlineSnapshot(`1`);
  });
});
