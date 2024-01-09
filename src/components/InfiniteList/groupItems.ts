import { GroupedVirtuosoProps } from 'react-virtuoso';
import { InfiniteListProps } from './InfiniteList';

export interface Group<T> {
  label: string;
  items: Array<T>;
}

export const groupItems = <T, C>(
  data: NonNullable<GroupedVirtuosoProps<T, C>['data']>,
  groupBy: InfiniteListProps<T, C>['groupBy'],
): {
  items: Array<T>;
  groupCounts: Array<number>;
  groupLabels: Array<string>;
} => {
  if (!groupBy) {
    return { items: [...data], groupCounts: [], groupLabels: [] };
  }

  // Group the items by their label
  const groupsMap = data.reduce((groupsMap, item) => {
    const { label, order = label } = groupBy(item);
    const group: Group<T> = groupsMap.get(order) ?? {
      label,
      items: [],
    };
    group.items.push(item);
    groupsMap.set(order, group);
    return groupsMap;
  }, new Map<number | string, Group<T>>());

  // Sort the groups by their order
  const groups = Array.from(groupsMap.entries())
    .sort(([order1], [order2]) =>
      order1 > order2 ? 1 : order1 < order2 ? -1 : 0,
    )
    .map(([_order, group]) => group);

  return {
    items: groups.flatMap(({ items }) => items),
    groupCounts: groups.map(({ items }) => items.length),
    groupLabels: groups.map(({ label }) => label),
  };
};
