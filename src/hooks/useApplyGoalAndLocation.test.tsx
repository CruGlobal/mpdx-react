import { ReactElement } from 'react';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import { useSnackbar } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AccountGeographicLocationQuery } from './AccountGeographicLocation.generated';
import { useApplyGoalAndLocation } from './useApplyGoalAndLocation';

jest.mock('notistack');

const mockUseSnackbar = useSnackbar as jest.Mock;
const enqueueSnackbar = jest.fn();
const mutationSpy = jest.fn();

interface TestWrapperProps {
  children: ReactElement;
  accountGeographicLocation?: string | null;
}

const TestWrapper = ({
  children,
  accountGeographicLocation = null,
}: TestWrapperProps) => (
  <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
    <GqlMockedProvider<{
      AccountGeographicLocation: AccountGeographicLocationQuery;
    }>
      mocks={{
        AccountGeographicLocation: {
          accountList: {
            settings: { geographicLocation: accountGeographicLocation },
          },
        },
      }}
      onCall={mutationSpy}
    >
      {children}
    </GqlMockedProvider>
  </TestRouter>
);

const renderApplyGoalAndLocation = (
  geographicLocation: string | null,
  accountGeographicLocation: string | null = null,
) =>
  renderHook(() => useApplyGoalAndLocation(geographicLocation), {
    wrapper: ({ children }: TestWrapperProps) => (
      <TestWrapper accountGeographicLocation={accountGeographicLocation}>
        {children}
      </TestWrapper>
    ),
  });

describe('useApplyGoalAndLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSnackbar.mockReturnValue({ enqueueSnackbar });
  });

  it('writes the new location and names it when the location changed', async () => {
    const { result } = renderApplyGoalAndLocation('Miami, FL', null);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AccountGeographicLocation'),
    );
    expect(result.current.geographicLocationChanged).toBe(true);
    expect(result.current.normalizedGeographicLocation).toBe('Miami, FL');

    result.current.applyMonthlyGoal(16139);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
        input: {
          id: 'account-list-1',
          attributes: {
            id: 'account-list-1',
            settings: { monthlyGoal: 16139, geographicLocation: 'Miami, FL' },
          },
        },
      }),
    );

    expect(enqueueSnackbar).toHaveBeenCalledWith(
      'Successfully updated your monthly goal to $16,139 and geographic location to Miami, FL!',
      { variant: 'success' },
    );
  });

  it('does not mention location in the snackbar when it is unchanged', async () => {
    const { result } = renderApplyGoalAndLocation('Miami, FL', 'Miami, FL');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AccountGeographicLocation'),
    );
    expect(result.current.geographicLocationChanged).toBe(false);

    result.current.applyMonthlyGoal(16139);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences'),
    );

    expect(enqueueSnackbar).toHaveBeenCalledWith(
      'Successfully updated your monthly goal to $16,139!',
      { variant: 'success' },
    );
  });

  it('normalizes a null location to None when the saved location is set', async () => {
    const { result } = renderApplyGoalAndLocation(null, 'Miami, FL');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AccountGeographicLocation'),
    );
    expect(result.current.geographicLocationChanged).toBe(true);
    expect(result.current.normalizedGeographicLocation).toBe('None');

    result.current.applyMonthlyGoal(16139);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
        input: {
          id: 'account-list-1',
          attributes: {
            id: 'account-list-1',
            settings: { monthlyGoal: 16139, geographicLocation: 'None' },
          },
        },
      }),
    );

    expect(enqueueSnackbar).toHaveBeenCalledWith(
      'Successfully updated your monthly goal to $16,139 and geographic location to None!',
      { variant: 'success' },
    );
  });

  it('writes only the location and shows no snackbar when no monthlyGoal is given', async () => {
    const { result } = renderApplyGoalAndLocation('Miami, FL', null);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AccountGeographicLocation'),
    );

    result.current.applyMonthlyGoal();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
        input: {
          id: 'account-list-1',
          attributes: {
            id: 'account-list-1',
            settings: { geographicLocation: 'Miami, FL' },
          },
        },
      }),
    );

    expect(enqueueSnackbar).not.toHaveBeenCalled();
  });
});
