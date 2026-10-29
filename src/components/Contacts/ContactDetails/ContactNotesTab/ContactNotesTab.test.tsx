import React from 'react';
import {
  ApolloCache,
  DefaultOptions,
  NormalizedCacheObject,
} from '@apollo/client';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockNavigatorOnline } from '__tests__/util/mockNavigatorOnline';
import { createCache } from 'src/lib/apollo/cache';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactNotesTab } from './ContactNotesTab';
import {
  GetContactNotesDocument,
  GetContactNotesQuery,
  UpdateContactNotesMutation,
} from './ContactNotesTab.generated';

const mockUseUpdateContactNotesMutation = jest.fn();
jest.mock('./ContactNotesTab.generated', () => ({
  ...jest.requireActual('./ContactNotesTab.generated'),
  useUpdateContactNotesMutation: (...args: unknown[]) =>
    mockUseUpdateContactNotesMutation(...args),
}));

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const setOnline = mockNavigatorOnline();

describe('ContactNotesTab', () => {
  beforeEach(() => {
    mockUseUpdateContactNotesMutation.mockImplementation(
      jest.requireActual('./ContactNotesTab.generated')
        .useUpdateContactNotesMutation,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders', () => {
    const { queryByPlaceholderText } = render(
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactNotesTab accountListId="123" contactId="abc" />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>,
    );
    expect(queryByPlaceholderText('Add contact notes')).toBeVisible();
  });

  it('holds unsaved notes while offline and saves them once when back online', async () => {
    const mutationSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider<{ GetContactNotes: GetContactNotesQuery }>
            mocks={{
              GetContactNotes: { contact: { id: 'abc', notes: '' } },
            }}
            onCall={mutationSpy}
          >
            <ContactDetailProvider>
              <ContactNotesTab accountListId="123" contactId="abc" />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>,
    );
    const input = getByPlaceholderText('Add contact notes');
    await waitFor(() => expect(input).toBeEnabled());
    jest.useFakeTimers();
    userEvent.type(input, 'abc');
    setOnline(false);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    const updateCalls = () =>
      mutationSpy.mock.calls.filter(
        ([{ operation }]) => operation.operationName === 'UpdateContactNotes',
      );
    expect(updateCalls()).toHaveLength(0);
    expect(input).toBeDisabled();
    expect(input).toHaveValue('abc');

    setOnline(true);

    await waitFor(() => expect(updateCalls()).toHaveLength(1));
    expect(updateCalls()[0][0].operation.variables.notes).toBe('abc');
    expect(input).toBeEnabled();
  });

  it('waits for a save to finish before sending the next one', async () => {
    const saves: Array<{ notes: string; finish: () => void }> = [];
    mockUseUpdateContactNotesMutation.mockReturnValue([
      ({ variables }: { variables: { notes: string } }) =>
        new Promise<void>((resolve) =>
          saves.push({ notes: variables.notes, finish: resolve }),
        ),
    ]);
    const { getByPlaceholderText } = render(
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider<{ GetContactNotes: GetContactNotesQuery }>
            mocks={{
              GetContactNotes: { contact: { id: 'abc', notes: '' } },
            }}
          >
            <ContactDetailProvider>
              <ContactNotesTab accountListId="123" contactId="abc" />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>,
    );
    const input = getByPlaceholderText('Add contact notes');
    await waitFor(() => expect(input).toBeEnabled());
    jest.useFakeTimers();
    for (const text of ['a', 'b', 'c']) {
      userEvent.type(input, text);
      await act(async () => {
        jest.advanceTimersByTime(500);
      });
    }
    expect(saves.map(({ notes }) => notes)).toEqual(['a']);

    await act(async () => saves[0].finish());
    expect(saves.map(({ notes }) => notes)).toEqual(['a', 'abc']);

    await act(async () => saves[1].finish());
    expect(saves).toHaveLength(2);
  });

  describe('switching contacts', () => {
    const mutationSpy = jest.fn();
    const failFirstSave = jest.fn();
    const TestComponent: React.FC<{
      contactId: string;
      cache?: ApolloCache<NormalizedCacheObject>;
    }> = ({ contactId, cache }) => (
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider<{ GetContactNotes: GetContactNotesQuery }>
            cache={cache}
            mocks={{
              GetContactNotes: { contact: { notes: '' } },
              UpdateContactNotes: () => failFirstSave(),
            }}
            onCall={mutationSpy}
          >
            <ContactDetailProvider>
              <ContactNotesTab accountListId="123" contactId={contactId} />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>
    );
    const updateCalls = () =>
      mutationSpy.mock.calls
        .map(([{ operation }]) => operation)
        .filter(({ operationName }) => operationName === 'UpdateContactNotes');

    beforeEach(() => {
      failFirstSave.mockReset();
    });

    it('saves notes typed offline onto the original contact', async () => {
      const { getByPlaceholderText, rerender } = render(
        <TestComponent contactId="A" />,
      );
      const input = getByPlaceholderText('Add contact notes');
      await waitFor(() => expect(input).toBeEnabled());
      userEvent.type(input, 'abc');
      setOnline(false);
      rerender(<TestComponent contactId="B" />);
      setOnline(true);

      await waitFor(() => expect(updateCalls()).toHaveLength(1));
      expect(updateCalls()[0].variables).toMatchObject({
        contactId: 'A',
        notes: 'abc',
      });
    });

    it('saves each contact its own text when switching within the debounce', async () => {
      const { getByPlaceholderText, rerender } = render(
        <TestComponent contactId="A" />,
      );
      const input = getByPlaceholderText('Add contact notes');
      await waitFor(() => expect(input).toBeEnabled());
      userEvent.type(input, 'aaa');
      rerender(<TestComponent contactId="B" />);
      // Wait for B's notes to load so they don't reset the field mid-typing
      await waitFor(() =>
        expect(
          mutationSpy.mock.calls.some(
            ([{ operation }]) =>
              operation.operationName === 'GetContactNotes' &&
              operation.variables.contactId === 'B',
          ),
        ).toBe(true),
      );
      userEvent.type(input, 'bbb');

      await waitFor(() => expect(updateCalls()).toHaveLength(2));
      const saved = updateCalls().map(({ variables }) => [
        variables.contactId,
        variables.notes,
      ]);
      expect(saved).toEqual(
        expect.arrayContaining([
          ['A', 'aaa'],
          ['B', 'bbb'],
        ]),
      );
    });

    it('resets the field to the new contact notes when both have the same notes', async () => {
      const cache = createCache();
      ['A', 'B'].forEach((contactId) =>
        cache.writeQuery({
          query: GetContactNotesDocument,
          variables: { contactId, accountListId: '123' },
          data: {
            contact: {
              __typename: 'Contact',
              id: contactId,
              notes: '',
              notesSavedAt: null,
            },
          },
        }),
      );
      const { getByPlaceholderText, rerender } = render(
        <TestComponent contactId="A" cache={cache} />,
      );
      const input = getByPlaceholderText('Add contact notes');
      userEvent.type(input, 'abc');

      // B's notes are already cached, so they are available immediately
      rerender(<TestComponent contactId="B" cache={cache} />);

      expect(input).toHaveValue('');
      userEvent.type(input, 'x');

      await waitFor(() =>
        expect(
          updateCalls().some(
            ({ variables }) =>
              variables.contactId === 'B' && variables.notes === 'x',
          ),
        ).toBe(true),
      );
      expect(
        updateCalls().map(({ variables }) => variables.notes),
      ).not.toContain('abcx');
    });

    it('shows the notes again when returning to an edited contact', () => {
      const cache = createCache();
      ['A', 'B'].forEach((contactId) =>
        cache.writeQuery({
          query: GetContactNotesDocument,
          variables: { contactId, accountListId: '123' },
          data: {
            contact: {
              __typename: 'Contact',
              id: contactId,
              notes: `${contactId} notes`,
              notesSavedAt: null,
            },
          },
        }),
      );
      const { getByPlaceholderText, rerender } = render(
        <TestComponent contactId="A" cache={cache} />,
      );
      const input = getByPlaceholderText('Add contact notes');
      userEvent.type(input, ' x');

      rerender(<TestComponent contactId="B" cache={cache} />);
      expect(input).toHaveValue('B notes');

      rerender(<TestComponent contactId="A" cache={cache} />);
      expect(input).toHaveValue('A notes');
    });

    it('retries a failed save after reconnecting', async () => {
      failFirstSave.mockImplementationOnce(() => {
        throw new Error('network');
      });
      const { getByPlaceholderText } = render(<TestComponent contactId="A" />);
      const input = getByPlaceholderText('Add contact notes');
      await waitFor(() => expect(input).toBeEnabled());
      userEvent.type(input, 'abc');

      await waitFor(() => expect(failFirstSave).toHaveBeenCalledTimes(1));
      setOnline(false);
      setOnline(true);

      await waitFor(() => expect(updateCalls()).toHaveLength(1));
      expect(updateCalls()[0].variables).toMatchObject({
        contactId: 'A',
        notes: 'abc',
      });
    });
  });

  describe('saved notes', () => {
    // Match the app client so a cached result is followed by a network result
    const defaultOptions: DefaultOptions = {
      watchQuery: { fetchPolicy: 'cache-and-network' },
    };
    const TestComponent: React.FC<{
      cache: ApolloCache<NormalizedCacheObject>;
      savedNotes: string;
    }> = ({ cache, savedNotes }) => (
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider<{
            GetContactNotes: GetContactNotesQuery;
            UpdateContactNotes: UpdateContactNotesMutation;
          }>
            cache={cache}
            defaultOptions={defaultOptions}
            mocks={{
              GetContactNotes: { contact: { id: 'abc', notes: 'old' } },
              UpdateContactNotes: {
                updateContact: { contact: { id: 'abc', notes: savedNotes } },
              },
            }}
          >
            <ContactDetailProvider>
              <ContactNotesTab accountListId="123" contactId="abc" />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>
    );
    const cachedNotes = (cache: ApolloCache<NormalizedCacheObject>) =>
      cache.readQuery<GetContactNotesQuery>({
        query: GetContactNotesDocument,
        variables: { contactId: 'abc', accountListId: '123' },
      })?.contact.notes;
    const cacheWithNotes = (notes: string) => {
      const cache = createCache();
      cache.writeQuery({
        query: GetContactNotesDocument,
        variables: { contactId: 'abc', accountListId: '123' },
        data: {
          contact: {
            __typename: 'Contact',
            id: 'abc',
            notes,
            notesSavedAt: null,
          },
        },
      });
      return cache;
    };

    it('replaces stale cached notes with the network result before an edit', async () => {
      const { getByPlaceholderText } = render(
        <TestComponent cache={cacheWithNotes('stale')} savedNotes="old" />,
      );
      const input = getByPlaceholderText('Add contact notes');
      expect(input).toHaveValue('stale');

      await waitFor(() => expect(input).toHaveValue('old'));
    });

    it('keeps text typed over cached notes when the network result arrives', async () => {
      const cache = cacheWithNotes('stale');
      const { getByPlaceholderText } = render(
        <TestComponent cache={cache} savedNotes="stale x" />,
      );
      const input = getByPlaceholderText('Add contact notes');
      userEvent.type(input, ' x');

      await waitFor(() => expect(cachedNotes(cache)).toBe('old'));
      expect(input).toHaveValue('stale x');
    });

    it('stores the saved notes in the cache', async () => {
      const cache = createCache();
      const { getByPlaceholderText } = render(
        <TestComponent cache={cache} savedNotes="old new" />,
      );
      const input = getByPlaceholderText('Add contact notes');
      await waitFor(() => expect(input).toHaveValue('old'));
      userEvent.type(input, ' new');

      await waitFor(() => expect(cachedNotes(cache)).toBe('old new'));
    });

    it('keeps text typed after the save started when the save finishes', async () => {
      const cache = createCache();
      const { getByPlaceholderText } = render(
        <TestComponent cache={cache} savedNotes="old n" />,
      );
      const input = getByPlaceholderText('Add contact notes');
      await waitFor(() => expect(input).toHaveValue('old'));
      userEvent.type(input, ' new');

      await waitFor(() => expect(cachedNotes(cache)).toBe('old n'));
      expect(input).toHaveValue('old new');
    });
  });

  it('saves new note', async () => {
    const mutationSpy = jest.fn();
    const note = 'cool new note!';
    const { queryByPlaceholderText, getByText } = render(
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider onCall={mutationSpy}>
            <ContactDetailProvider>
              <ContactNotesTab accountListId="123" contactId="abc" />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>,
    );
    const input = queryByPlaceholderText('Add contact notes');
    expect(input).toBeVisible();
    input && userEvent.type(input, note);
    await waitFor(() => expect(getByText(note)).toBeVisible());
    const { operation } = mutationSpy.mock.calls[0][0];

    await waitFor(() =>
      expect(operation.variables.accountListId).toEqual('123'),
    );

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Notes successfully saved.', {
        variant: 'success',
        preventDuplicate: true,
      }),
    );
  });
});
