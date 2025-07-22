import { removeTagsFromFilters } from './sanitizeFilters';

describe('sanitizeFilters', () => {
  const userIds = ['contact-1'];

  it('should filter out anyTags when tags filter is missing', () => {
    expect(removeTagsFromFilters({ userIds, anyTags: true })).toEqual({
      userIds,
    });
  });

  it('should filter out anyTags when tags filter is empty', () => {
    expect(removeTagsFromFilters({ userIds, tags: [], anyTags: true })).toEqual(
      {
        userIds,
        tags: [],
      },
    );
  });

  it('should not filter out anyTags when tags filter is present', () => {
    expect(
      removeTagsFromFilters({ userIds, tags: ['tag'], anyTags: true }),
    ).toEqual({
      userIds,
      tags: ['tag'],
      anyTags: true,
    });
  });
});
