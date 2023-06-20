import { TaskFilterSetInput } from '../../graphql/types.generated';

// Filter out anyTags when there aren't any tag filters present
export const sanitizeFilters = ({
  anyTags,
  ...filters
}: TaskFilterSetInput): TaskFilterSetInput => {
  if (filters.tags?.length) {
    return { ...filters, anyTags };
  }
  return filters;
};
