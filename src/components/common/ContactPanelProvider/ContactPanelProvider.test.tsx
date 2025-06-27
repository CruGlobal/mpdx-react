import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import {
  ContactPanelProvider,
  getQueryContactId,
  setQueryContactId,
  useContactPanel,
} from './ContactPanelProvider';

const contactId = '00000000-0000-0000-0000-000000000000';
const newContactId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

describe('getQueryContactId', () => {
  it('should return undefined if the contactId is missing', () => {
    const query = {};
    expect(getQueryContactId(query, 'contactId')).toBeUndefined();
  });

  it('should return undefined if the contactId is a string', () => {
    const query = { contactId };
    expect(getQueryContactId(query, 'contactId')).toBeUndefined();
  });

  it('should return undefined if the contactId is an empty array', () => {
    const query = { contactId: [] };
    expect(getQueryContactId(query, 'contactId')).toBeUndefined();
  });

  it('should return undefined if the contactId is not a UUID', () => {
    const query = { contactId: ['flows'] };
    expect(getQueryContactId(query, 'contactId')).toBeUndefined();
  });

  it('should return the contact id if the contactId is a UUID', () => {
    const query = { contactId: [contactId] };
    expect(getQueryContactId(query, 'contactId')).toBe(contactId);
  });

  it('should return the contact id if the contactId is an array ending with a UUID', () => {
    const query = { contactId: [contactId] };
    expect(getQueryContactId(query, 'contactId')).toBe(contactId);
  });
});

describe('setQueryContactId', () => {
  it('should remove the existing contactId if contactId is undefined', () => {
    const query = { contactId: ['flows', contactId], key: 'value' };
    const result = setQueryContactId(query, 'contactId', undefined);
    expect(result).toEqual({
      contactId: ['flows'],
      key: 'value',
    });
  });

  it('should add replace the existing contactId', () => {
    const query = { contactId: [contactId], key: 'value' };
    const result = setQueryContactId(query, 'contactId', newContactId);
    expect(result).toEqual({
      contactId: [newContactId],
      key: 'value',
    });
  });

  it('should add a new contactId to the array', () => {
    const query = { contactId: ['flows'], key: 'value' };
    const result = setQueryContactId(query, 'contactId', newContactId);
    expect(result).toEqual({
      contactId: ['flows', newContactId],
      key: 'value',
    });
  });

  it('should handle contactId param not being an array', () => {
    const query = { contactId: contactId, key: 'value' };
    const result = setQueryContactId(query, 'contactId', newContactId);
    expect(result).toEqual({
      contactId: [newContactId],
      key: 'value',
    });
  });

  it('should handle contactId param ending with a route segment', () => {
    const query = { contactId: ['flows'], key: 'value' };
    const result = setQueryContactId(query, 'contactId', newContactId);
    expect(result).toEqual({
      contactId: ['flows', newContactId],
      key: 'value',
    });
  });

  it('should handle missing contactId param', () => {
    const query = { key: 'value' };
    const result = setQueryContactId(query, 'contactId', newContactId);
    expect(result).toEqual({
      contactId: [newContactId],
      key: 'value',
    });
  });

  it('should handle other contactIdParam', () => {
    const query = { appealId: ['flows', contactId], key: 'value' };
    const result = setQueryContactId(query, 'appealId', newContactId);
    expect(result).toEqual({
      appealId: ['flows', newContactId],
      key: 'value',
    });
  });

  it('should not mutate the original query object', () => {
    const query = { contactId: ['flows', contactId], key: 'value' };
    const result = setQueryContactId(query, 'contactId', newContactId);
    expect(result).not.toBe(query);
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
        query: { contactId: [] },
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
