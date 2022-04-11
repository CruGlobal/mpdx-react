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

const coachingId = 'coaching-id';
describe('LoadCoachingDetail', () => {
  it('view', async () => {
    const { findByText } = render(
      <GqlMockedProvider<LoadCoachingDetailQuery>
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
      </GqlMockedProvider>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $55')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });
  it('null goal', async () => {
    const { findByText } = render(
      <GqlMockedProvider<LoadCoachingDetailQuery>
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
      </GqlMockedProvider>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $0')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });

  it('view isAccountList', async () => {
    const { findByText } = render(
      <GqlMockedProvider<LoadCoachingDetailQuery>
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
      </GqlMockedProvider>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $55')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });
  it('null goal isAccountList', async () => {
    const { findByText } = render(
      <GqlMockedProvider<LoadCoachingDetailQuery>
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
      </GqlMockedProvider>,
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
    ).toMatchInlineSnapshot(`3`);
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
    ).toMatchInlineSnapshot(`3`);
  });
});
