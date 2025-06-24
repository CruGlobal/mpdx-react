import { getQueryContactId, setQueryContactId } from './ContactPanelProvider';

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
