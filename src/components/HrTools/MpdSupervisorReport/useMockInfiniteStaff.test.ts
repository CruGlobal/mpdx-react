import { act, renderHook } from '@testing-library/react';
import { EmployeeData, QuarterHealthEnum } from './mockData';
import { useMockInfiniteStaff } from './useMockInfiniteStaff';

const makeItems = (count: number): EmployeeData[] =>
  Array.from({ length: count }, (_, i) => ({
    user: {
      id: `member-${i + 1}`,
      preferredName: `User${i + 1}`,
      lastName: `Last${i + 1}`,
      personNumber: String(10000000 + i),
      staffAccountID: String(1000000000 + i),
      userPersonType: 'Full time',
      team: 'Campus',
    },
    quarters: [
      { label: 'FQ4 25', health: QuarterHealthEnum.Green, payroll: 15000 },
      { label: 'FQ1 26', health: QuarterHealthEnum.Green, payroll: 15000 },
      { label: 'FQ2 26', health: QuarterHealthEnum.Green, payroll: 15000 },
      { label: 'FQ3 26', health: QuarterHealthEnum.Green, payroll: 15000 },
    ],
  }));

describe('useMockInfiniteStaff', () => {
  it('returns first pageSize items and hasNextPage true when more exist', () => {
    const items = makeItems(60);
    const { result } = renderHook(() => useMockInfiniteStaff(items, 25));

    expect(result.current.data.nodes).toHaveLength(25);
    expect(result.current.data.pageInfo.hasNextPage).toBe(true);
    expect(result.current.data.pageInfo.endCursor).toBe('25');
    expect(result.current.loading).toBe(false);
  });

  it('fetchMore appends the next page', () => {
    const items = makeItems(60);
    const { result } = renderHook(() => useMockInfiniteStaff(items, 25));

    act(() => {
      result.current.fetchMore();
    });

    expect(result.current.data.nodes).toHaveLength(50);
    expect(result.current.data.pageInfo.hasNextPage).toBe(true);
    expect(result.current.data.pageInfo.endCursor).toBe('50');
  });

  it('fetchMore past the end does not exceed allItems.length and sets hasNextPage false', () => {
    const items = makeItems(30);
    const { result } = renderHook(() => useMockInfiniteStaff(items, 25));

    // First fetchMore loads all remaining items
    act(() => {
      result.current.fetchMore();
    });

    expect(result.current.data.nodes).toHaveLength(30);
    expect(result.current.data.pageInfo.hasNextPage).toBe(false);

    // Calling fetchMore again should be a no-op
    act(() => {
      result.current.fetchMore();
    });

    expect(result.current.data.nodes).toHaveLength(30);
    expect(result.current.data.pageInfo.hasNextPage).toBe(false);
  });

  it('resets to page 1 when allItems reference changes', () => {
    const items = makeItems(60);
    const { result, rerender } = renderHook(
      ({ allItems }: { allItems: EmployeeData[] }) =>
        useMockInfiniteStaff(allItems, 25),
      { initialProps: { allItems: items } },
    );

    // Load page 2
    act(() => {
      result.current.fetchMore();
    });
    expect(result.current.data.nodes).toHaveLength(50);

    // Replace with a new filtered array — should reset to page 1
    const filteredItems = makeItems(40);
    rerender({ allItems: filteredItems });

    expect(result.current.data.nodes).toHaveLength(25);
    expect(result.current.data.pageInfo.hasNextPage).toBe(true);
  });

  it('reports hasNextPage false immediately when allItems is smaller than pageSize', () => {
    const items = makeItems(10);
    const { result } = renderHook(() => useMockInfiniteStaff(items, 25));

    expect(result.current.data.nodes).toHaveLength(10);
    expect(result.current.data.pageInfo.hasNextPage).toBe(false);
    expect(result.current.data.pageInfo.endCursor).toBe('10');
  });
});
