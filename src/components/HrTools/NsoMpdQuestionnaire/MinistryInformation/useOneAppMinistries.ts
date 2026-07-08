import { useMemo } from 'react';
import { MinistriesQuery, useMinistriesQuery } from './Ministries.generated';

export interface MinistryOption {
  id: string;
  name: string;
}

interface UseOneAppMinistriesResult {
  ministries: MinistryOption[];
  loading: boolean;
}

/**
 * OneApp root names whose sub-ministries are shown directly in the flat list.
 * These must match the upstream OneApp labels exactly.
 */
const EXPANDABLE_ROOT_MINISTRIES = ['Campus Ministry', 'Other Ministries'];
/** Catch-all option pinned to the bottom of the list. */
const PINNED_LAST_MINISTRY = 'Other';

/** Alphabetical sort, with "Other" pinned to the end of the list. */
const compareMinistries = (a: MinistryOption, b: MinistryOption): number => {
  const aIsOther = a.name === PINNED_LAST_MINISTRY;
  const bIsOther = b.name === PINNED_LAST_MINISTRY;
  if (aIsOther || bIsOther) {
    return Number(aIsOther) - Number(bIsOther);
  }
  return a.name.localeCompare(b.name);
};

/**
 * Flattens the OneApp ministry tree into the options shown in the
 * questionnaire's ministry dropdown. Roots in {@link EXPANDABLE_ROOT_MINISTRIES}
 * are replaced by their sub-ministries; every other root is kept as a single
 * option. Ministries without a name are dropped. Options are sorted
 * alphabetically, with "Other" pinned to the end.
 */
export const flattenMinistries = (
  ministries: MinistriesQuery['ministries'],
): MinistryOption[] =>
  ministries
    .flatMap((root) =>
      EXPANDABLE_ROOT_MINISTRIES.includes(root.name ?? '')
        ? root.children
        : [root],
    )
    .flatMap((ministry) =>
      ministry.name ? [{ id: ministry.id, name: ministry.name }] : [],
    )
    .sort(compareMinistries);

export const useOneAppMinistries = (): UseOneAppMinistriesResult => {
  const { data, loading } = useMinistriesQuery({
    fetchPolicy: 'cache-first',
  });

  const ministries = useMemo(
    () => (data ? flattenMinistries(data.ministries) : []),
    [data],
  );

  return { ministries, loading };
};
