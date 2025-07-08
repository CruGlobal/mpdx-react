import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import {
  ContactPanelProvider,
  extractContactId,
  useContactPanel,
} from './ContactPanelProvider';

const contactId = '00000000-0000-0000-0000-000000000000';
const newContactId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

describe('extractContactId', () => {
  it('should return undefined when contactId is undefined', () => {
    expect(extractContactId(undefined, 0)).toEqual(undefined);
  });

  it('should return undefined when contactId is a string', () => {
    expect(extractContactId(contactId, 0)).toEqual(undefined);
  });

  it('should return undefined when contactId is an empty array', () => {
    expect(extractContactId([], 0)).toEqual(undefined);
  });

  it('should return undefined when contactId is not a UUID', () => {
    expect(extractContactId(['flows'], 0)).toEqual(undefined);
  });

  it('should return the id when contactId is a UUID', () => {
    expect(extractContactId([contactId], 0)).toEqual(contactId);
  });

  it('should return the id when contactId is an array ending with a UUID', () => {
    expect(extractContactId(['flows', contactId], 0)).toEqual(contactId);
  });

  it('should return undefined when the entire array is the prefix', () => {
    expect(extractContactId([contactId], 1)).toEqual(undefined);
  });

  it('should return the id when the entire array is longer than the prefix', () => {
    expect(extractContactId([contactId, newContactId], 1)).toEqual(
      newContactId,
    );
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
            appealId: [contactId],
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
        query: { appealId: [newContactId] },
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
        query: {},
      },
      undefined,
      { shallow: true },
    );
    expect(result.current.openContactId).toBeUndefined();
    expect(result.current.isOpen).toBe(false);

    expect(result.current.buildContactUrl(newContactId)).toEqual({
      pathname,
      query: { appealId: [newContactId] },
    });
  });

  it('should support customizing contactIdPrefix and prefixMinLength', () => {
    const contactIdPrefix = [contactId];
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TestRouter
        router={{
          push,
          pathname,
          query: {
            contactId: [contactId],
          },
        }}
      >
        <ContactPanelProvider
          contactIdPrefix={contactIdPrefix}
          prefixMinLength={1}
        >
          {children}
        </ContactPanelProvider>
      </TestRouter>
    );

    const { result } = renderHook(() => useContactPanel(), {
      wrapper: Wrapper,
    });

    expect(result.current.openContactId).toBeUndefined();
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openContact(newContactId);
    });

    expect(push).toHaveBeenLastCalledWith(
      {
        pathname,
        query: { contactId: [contactId, newContactId] },
      },
      undefined,
      { shallow: true },
    );
    expect(result.current.openContactId).toBe(newContactId);
    expect(result.current.isOpen).toBe(true);
  });

  it('should throw if used outside of <ContactPanelContext>', () => {
    const { result } = renderHook(() => useContactPanel());

    expect(result.error?.message).toMatch(/ContactPanelContext/);
  });
});
