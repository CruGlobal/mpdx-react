import { ReactElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { useDeleteSalaryCalculation } from './useDeleteSalaryCalculation';

const mutationSpy = jest.fn();

const wrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider onCall={mutationSpy}>{children}</GqlMockedProvider>
);

describe('useDeleteSalaryCalculation', () => {
  it('calls delete mutation', async () => {
    const { result } = renderHook(() => useDeleteSalaryCalculation(), {
      wrapper,
    });

    await result.current.deleteSalaryCalculation('calculation-id');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteSalaryCalculation', {
        input: { id: 'calculation-id' },
      }),
    );
  });
});
