import { sanitizeFilters } from './sanitizeFilters';

describe('sanitizeFilters', () => {
  const userIds = ['contact-1'];

  it('should filter out anyTags when tags filter is missing', () => {
    expect(sanitizeFilters({ userIds, anyTags: true })).toEqual({
      userIds,
    });
  });

  it('should filter out anyTags when tags filter is empty', () => {
    expect(sanitizeFilters({ userIds, tags: [], anyTags: true })).toEqual({
      userIds,
      tags: [],
    });
  });

  it('should not filter out anyTags when tags filter is present', () => {
    expect(sanitizeFilters({ userIds, tags: ['tag'], anyTags: true })).toEqual({
      userIds,
      tags: ['tag'],
      anyTags: true,
    });
  });
});
