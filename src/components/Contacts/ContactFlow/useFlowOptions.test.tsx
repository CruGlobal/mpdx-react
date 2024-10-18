import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { StatusEnum } from 'src/graphql/types.generated';
import { GetUserOptionsQuery } from './GetUserOptions.generated';
import { useFlowOptions } from './useFlowOptions';

const Wrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider<{ GetUserOptions: GetUserOptionsQuery }>
    mocks={{
      UserOption: {
        userOption: {
          key: 'flows',
          value: JSON.stringify([
            {
              id: 'flow-1',
              name: 'Column',
              statuses: ['NEVER_ASK', 'Partner - Financial', 'foo'],
              color: 'color-success',
            },
          ]),
        },
      },
    }}
  >
    {children}
  </GqlMockedProvider>
);

describe('useFlowOptions', () => {
  it('loading is initially true', () => {
    const { result } = renderHook(useFlowOptions, {
      wrapper: Wrapper,
    });

    expect(result.current).toEqual([
      [],
      expect.any(Function),
      { loading: true },
    ]);
  });

  it('converts old and new statuses to StatusEnum values and filters out invalid values', async () => {
    const { result, waitForNextUpdate } = renderHook(useFlowOptions, {
      wrapper: Wrapper,
    });

    await waitForNextUpdate();

    expect(result.current).toEqual([
      [
        {
          id: 'flow-1',
          name: 'Column',
          statuses: [StatusEnum.NeverAsk, StatusEnum.PartnerFinancial],
          color: 'color-success',
        },
      ],
      expect.any(Function),
      { loading: false },
    ]);
  });
});
