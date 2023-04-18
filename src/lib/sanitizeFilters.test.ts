import { sanitizeFilters } from './sanitizeFilters';

describe('sanitizeFilters', () => {
  it('should filter out anyTags when tags filter is missing', () => {
    expect(sanitizeFilters({ userIds: ['contact-1'], anyTags: true })).toEqual({
      userIds: ['contact-1'],
    });
  });

  it('should filter out anyTags when tags filter is empty', () => {
    expect(
      sanitizeFilters({ userIds: ['contact-1'], tags: [], anyTags: true }),
    ).toEqual({
      userIds: ['contact-1'],
      tags: [],
    });
  });

  it('should not filter out anyTags when tags filter is present', () => {
    expect(
      sanitizeFilters({ userIds: ['contact-1'], tags: ['tag'], anyTags: true }),
    ).toEqual({
      userIds: ['contact-1'],
      tags: ['tag'],
      anyTags: true,
    });
  });
});
