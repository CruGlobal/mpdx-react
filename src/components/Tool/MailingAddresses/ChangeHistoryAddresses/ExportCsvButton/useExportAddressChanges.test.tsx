import { ApolloError } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockAddressChangeHistory } from '../ChangeHistoryAddressesMock';
import { downloadAddressChanges } from './downloadAddressChanges';
import { useExportAddressChanges } from './useExportAddressChanges';

jest.mock('./downloadAddressChanges');

const fetchMore = jest.fn().mockResolvedValue({});
const firstPage = {
  ...mockAddressChangeHistory,
  pageInfo: { endCursor: 'cursor-1', hasNextPage: true },
};
const lastPage = {
  ...mockAddressChangeHistory,
  pageInfo: { endCursor: 'cursor-2', hasNextPage: false },
};

const renderExport = (error?: ApolloError) =>
  renderHook(
    ({ history }) => useExportAddressChanges({ history, fetchMore, error }),
    {
      initialProps: { history: firstPage },
      wrapper: ({ children }) => (
        <GqlMockedProvider>{children}</GqlMockedProvider>
      ),
    },
  );

describe('useExportAddressChanges', () => {
  it('loads the remaining pages, then downloads them', async () => {
    const { result, rerender } = renderExport();

    expect(fetchMore).not.toHaveBeenCalled();
    act(() => result.current.startExport());

    expect(result.current.exporting).toBe(true);
    expect(fetchMore).toHaveBeenCalledWith({
      variables: { after: 'cursor-1' },
    });
    expect(downloadAddressChanges).not.toHaveBeenCalled();

    rerender({ history: lastPage });

    await waitFor(() => expect(result.current.exporting).toBe(false));
    expect(downloadAddressChanges).toHaveBeenCalledWith(
      lastPage.nodes,
      undefined,
      expect.any(Function),
      expect.any(Function),
      'en-US',
    );
  });

  it('stops exporting without downloading when fetching a page rejects', async () => {
    // A rejected fetchMore never sets the query's error
    fetchMore.mockRejectedValueOnce(new Error('Page 2 failed'));
    const { result } = renderExport();

    act(() => result.current.startExport());

    await waitFor(() => expect(result.current.exporting).toBe(false));
    expect(downloadAddressChanges).not.toHaveBeenCalled();
  });

  it('stops exporting without downloading when a page fails to load', async () => {
    const { result } = renderExport(new ApolloError({}));

    act(() => result.current.startExport());

    await waitFor(() => expect(result.current.exporting).toBe(false));
    expect(downloadAddressChanges).not.toHaveBeenCalled();
  });
});
