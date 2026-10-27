import { ReactElement } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import theme from 'src/theme';
import {
  UpdateUserOptionMutation,
  UserOptionQuery,
} from './UserPreference.generated';
import { useFilterPanelOpen } from './useFilterPanelOpen';

const key = 'test_filters_collapse';

const mutationSpy = jest.fn();

const Wrapper = ({ children }: { children: ReactElement }) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      UserOption: UserOptionQuery;
      UpdateUserOption: UpdateUserOptionMutation;
    }>
      mocks={{
        UserOption: {
          userOption: { key, value: 'true' },
        },
        UpdateUserOption: {
          createOrUpdateUserOption: {
            option: { key, value: 'false' },
          },
        },
      }}
      onCall={mutationSpy}
    >
      {children}
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('useFilterPanelOpen', () => {
  describe('on larger screens', () => {
    it('uses and saves the user preference', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFilterPanelOpen(key),
        { wrapper: Wrapper },
      );

      await waitForNextUpdate();
      expect(result.current[0]).toBe(true);

      act(() => result.current[1](false));
      await waitForNextUpdate();

      expect(result.current[0]).toBe(false);
      expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOption', {
        key,
        value: 'false',
      });
    });
  });

  describe('on small screens', () => {
    beforeEach(() => {
      matchMediaMock({ width: '390px' });
    });

    it('starts closed even when the saved preference is open', async () => {
      const { result } = renderHook(() => useFilterPanelOpen(key), {
        wrapper: Wrapper,
      });

      await act(() => new Promise((resolve) => setTimeout(resolve)));

      expect(mutationSpy).toHaveGraphqlOperation('UserOption', { key });
      expect(result.current[0]).toBe(false);
    });

    it('opens and closes without saving the preference', async () => {
      const { result } = renderHook(() => useFilterPanelOpen(key), {
        wrapper: Wrapper,
      });

      act(() => result.current[1](true));
      expect(result.current[0]).toBe(true);

      act(() => result.current[1]((open) => !open));
      expect(result.current[0]).toBe(false);

      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateUserOption');
    });
  });
});
