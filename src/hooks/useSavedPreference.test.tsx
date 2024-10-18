import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UpdateUserOptionsMutation } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { createCache } from 'src/lib/apollo/cache';
import {
  UserOptionDocument,
  UserOptionQuery,
} from './UserPreference.generated';
import { useSavedPreference } from './useSavedPreference';

const key = 'test_option';
const defaultValue = 'default';
const newValue = 'changed';

const mutationSpy = jest.fn();

interface WrapperProps {
  cached?: boolean;
  json?: boolean;
}

/**
 * `renderHook` doesn't let you pass props to the wrapper. To workaround that, this function accepts
 * props to customize its behavior and creates a Wrapper component with access to those props.
 * The component returned from this function can be passed as the `wrapper` option to `renderHook`.
 **/
const makeWrapper = (props: WrapperProps = {}) => {
  const { cached = true, json = false } = props;

  const cache = createCache();
  if (cached) {
    // Prime the cache with an option
    cache.writeQuery<UserOptionQuery>({
      query: UserOptionDocument,
      data: {
        userOption: {
          __typename: 'Option' as const,
          key,
          value: json ? '["cached"]' : 'cached',
        },
      },
    });
  }

  const Wrapper = ({ children }: { children: ReactElement }) => (
    <GqlMockedProvider<{
      UserOption: UserOptionQuery;
      UpdateUserOptions: UpdateUserOptionsMutation;
    }>
      mocks={{
        UserOption: {
          userOption: {
            key,
            value: json ? '["initial"]' : 'initial',
          },
        },
        UpdateUserOptions: {
          createOrUpdateUserOption: {
            option: {
              key,
              value: json ? '["server"]' : 'server',
            },
          },
        },
      }}
      defaultOptions={{
        watchQuery: {
          // Execute the query also even though the result is cached
          fetchPolicy: cached ? 'cache-and-network' : undefined,
        },
      }}
      cache={cache}
      onCall={mutationSpy}
    >
      {children}
    </GqlMockedProvider>
  );
  return Wrapper;
};

describe('useSavedPreference', () => {
  it('returns the default value initially if the cache is empty', () => {
    const { result } = renderHook(
      () => useSavedPreference({ key, defaultValue }),
      {
        wrapper: makeWrapper({ cached: false }),
      },
    );

    expect(result.current[0]).toBe(defaultValue);
  });

  it('returns the cached value until the option refreshes', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSavedPreference({ key, defaultValue }),
      {
        wrapper: makeWrapper(),
      },
    );

    expect(result.current[0]).toBe('cached');

    await waitForNextUpdate();

    expect(mutationSpy).toHaveGraphqlOperation('UserOption', { key });
    expect(result.current[0]).toBe('initial');
  });

  it('setting the value updates the value optimistically then updates to the response value', async () => {
    const { result, waitForNextUpdate, rerender } = renderHook(
      () => useSavedPreference({ key, defaultValue }),
      {
        wrapper: makeWrapper({ cached: false }),
      },
    );

    result.current[1](newValue);
    rerender();
    expect(result.current[0]).toBe(newValue);

    await waitForNextUpdate();
    expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOptions', {
      key,
      value: newValue,
    });

    expect(result.current[0]).toBe('server');
  });

  it('serializes and deserializes the value as JSON', async () => {
    const { result, waitForNextUpdate, rerender } = renderHook(
      () => useSavedPreference({ key, defaultValue: [defaultValue] }),
      {
        wrapper: makeWrapper({ cached: false, json: true }),
      },
    );

    expect(result.current[0]).toEqual([defaultValue]);

    await waitForNextUpdate();

    result.current[1]([newValue]);
    rerender();
    expect(result.current[0]).toEqual([newValue]);

    await waitForNextUpdate();
    expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOptions', {
      key,
      value: '["changed"]',
    });
  });
});
