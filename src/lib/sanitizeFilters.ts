import { TaskFilterSetInput } from 'src/graphql/types.generated';

// Filter out anyTags when there aren't any tag filters present
export const sanitizeFilters = ({
  // Always filter out starred
  starred: _starred,
  anyTags,
  ...filters
}: TaskFilterSetInput): TaskFilterSetInput => {
  if (filters.tags?.length) {
    return { ...filters, anyTags };
  }
  return filters;
};
