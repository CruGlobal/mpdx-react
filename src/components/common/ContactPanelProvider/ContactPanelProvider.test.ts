import { setQueryContactId } from './ContactPanelProvider';

const existingContactId = '00000000-0000-0000-0000-000000000000';
const newContactId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

describe('setQueryContactId', () => {
  it('should remove the existing contactId if contactId is undefined', () => {
    const query = { contactId: ['flows', existingContactId], key: 'value' };
    const result = setQueryContactId(query, 'contactId', undefined);
    expect(result).toEqual({
      contactId: ['flows'],
      key: 'value',
    });
  });

  it('should add replace the existing contactId', () => {
    const query = { contactId: [existingContactId], key: 'value' };
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
    const query = { contactId: existingContactId, key: 'value' };
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
    const query = { appealId: ['flows', existingContactId], key: 'value' };
    const result = setQueryContactId(query, 'appealId', newContactId);
    expect(result).toEqual({
      appealId: ['flows', newContactId],
      key: 'value',
    });
  });

  it('should not mutate the original query object', () => {
    const query = { contactId: ['flows', existingContactId], key: 'value' };
    const result = setQueryContactId(query, 'contactId', newContactId);
    expect(result).not.toBe(query);
  });
});
