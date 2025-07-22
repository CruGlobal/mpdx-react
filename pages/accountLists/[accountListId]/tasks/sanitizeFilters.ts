import { TaskFilterSetInput } from 'src/graphql/types.generated';

// Filter out anyTags when there aren't any tag filters present
export const removeTagsFromFilters = ({
  anyTags,
  ...filters
}: any): TaskFilterSetInput => {
  if (filters.tags?.length) {
    return { ...filters, anyTags };
  }
  return filters;
};
