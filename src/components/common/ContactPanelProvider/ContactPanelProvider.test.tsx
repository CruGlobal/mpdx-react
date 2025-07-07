import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import {
  ContactPanelProvider,
  splitContactIdParam,
  useContactPanel,
} from './ContactPanelProvider';

const contactId = '00000000-0000-0000-0000-000000000000';
const newContactId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

describe('splitContactIdParam', () => {
  it('should handle contactId is undefined', () => {
    expect(splitContactIdParam(undefined, 0)).toEqual({
      prefix: [],
      contactId: undefined,
    });
  });

  it('should handle contactId is a string', () => {
    expect(splitContactIdParam(contactId, 0)).toEqual({
      prefix: [],
      contactId: undefined,
    });
  });

  it('should handle contactId is an empty array', () => {
    expect(splitContactIdParam([], 0)).toEqual({
      prefix: [],
      contactId: undefined,
    });
  });

  it('should handle contactId is not a UUID', () => {
    expect(splitContactIdParam(['flows'], 0)).toEqual({
      prefix: ['flows'],
      contactId: undefined,
    });
  });

  it('should handle contactId is a UUID', () => {
    expect(splitContactIdParam([contactId], 0)).toEqual({
      prefix: [],
      contactId,
    });
  });

  it('should handle contactId is an array ending with a UUID', () => {
    expect(splitContactIdParam(['flows', contactId], 0)).toEqual({
      prefix: ['flows'],
      contactId,
    });
  });

  it('should handle custom prefix length', () => {
    expect(splitContactIdParam([contactId], 1)).toEqual({
      prefix: [contactId],
      contactId: undefined,
    });

    expect(splitContactIdParam([contactId, newContactId], 1)).toEqual({
      prefix: [contactId],
      contactId: newContactId,
    });
  });
});

describe('useContactPanel', () => {
  const push = jest.fn();
  const pathname = '/page';
  const router = {
    push,
    pathname,
    query: {
      contactId: [contactId],
    },
  };

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestRouter router={router}>
      <ContactPanelProvider>{children}</ContactPanelProvider>
    </TestRouter>
  );

  it('should extract openContactId from the query', () => {
    const { result } = renderHook(() => useContactPanel(), {
      wrapper: Wrapper,
    });

    expect(result.current.openContactId).toBe(contactId);
    expect(result.current.isOpen).toBe(true);
  });

  it('openContact should open a new contact and update openContactId', () => {
    const { result } = renderHook(() => useContactPanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openContact(newContactId);
    });

    expect(push).toHaveBeenCalledWith(
      {
        pathname,
        query: { contactId: [newContactId] },
      },
      undefined,
      { shallow: true },
    );
    expect(result.current.openContactId).toBe(newContactId);
    expect(result.current.isOpen).toBe(true);
  });

  it('closePanel should close the panel and clear openContactId', () => {
    const { result } = renderHook(() => useContactPanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.closePanel();
    });

    expect(push).toHaveBeenCalledWith(
      {
        pathname,
        query: {},
      },
      undefined,
      { shallow: true },
    );
    expect(result.current.openContactId).toBeUndefined();
    expect(result.current.isOpen).toBe(false);
  });

  it('buildContactUrl should generate a contact URL', () => {
    const { result } = renderHook(() => useContactPanel(), {
      wrapper: Wrapper,
    });

    expect(result.current.buildContactUrl(newContactId)).toEqual({
      pathname,
      query: { contactId: [newContactId] },
    });
  });

  it('should support customizing contactIdParam', () => {
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TestRouter
        router={{
          push,
          pathname,
          query: {
            appealId: ['appeals', 'appeal-1', contactId],
          },
        }}
      >
        <ContactPanelProvider contactIdParam="appealId">
          {children}
        </ContactPanelProvider>
      </TestRouter>
    );

    const { result } = renderHook(() => useContactPanel(), {
      wrapper: Wrapper,
    });

    expect(result.current.openContactId).toBe(contactId);
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.openContact(newContactId);
    });

    expect(push).toHaveBeenLastCalledWith(
      {
        pathname,
        query: { appealId: ['appeals', 'appeal-1', newContactId] },
      },
      undefined,
      { shallow: true },
    );
    expect(result.current.openContactId).toBe(newContactId);
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closePanel();
    });

    expect(push).toHaveBeenLastCalledWith(
      {
        pathname,
        query: { appealId: ['appeals', 'appeal-1'] },
      },
      undefined,
      { shallow: true },
    );
    expect(result.current.openContactId).toBeUndefined();
    expect(result.current.isOpen).toBe(false);

    expect(result.current.buildContactUrl(newContactId)).toEqual({
      pathname,
      query: { appealId: ['appeals', 'appeal-1', newContactId] },
    });
  });

  it('should throw if used outside of <ContactPanelContext>', () => {
    const { result } = renderHook(() => useContactPanel());

    expect(result.error?.message).toMatch(/ContactPanelContext/);
  });
});
