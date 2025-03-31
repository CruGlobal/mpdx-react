import React, { ReactElement, useCallback, useMemo } from 'react';
import { List, ListItem, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  GroupedVirtuoso,
  GroupedVirtuosoProps,
  ItemContent,
  ItemProps,
  ListProps,
  Virtuoso,
  VirtuosoProps,
} from 'react-virtuoso';
import theme from 'src/theme';
import { groupItems } from './groupItems';

const height = 72;
const padding = 0;

// eslint-disable-next-line react/display-name
const ListContainer: React.ComponentType<ListProps> = React.forwardRef(
  (props, listRef) => (
    <List component="div" disablePadding {...props} ref={listRef} />
  ),
);

export const ItemWithBorders = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'disableHover',
})<{ disableHover?: boolean }>(({ disableHover }) => ({
  padding: `${padding}px`,
  '&:last-child': {
    borderBottom: 'none',
  },
  ...(disableHover
    ? {}
    : {
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
        '&:hover': {
          backgroundColor: theme.palette.mpdxGrayLight.main,
        },
      }),
}));

const SkeletonItem: React.FC<{ height: number }> = ({ height }) => (
  <ItemWithBorders disableGutters disableHover>
    <Skeleton variant="rectangular" height={height - padding * 2} />
  </ItemWithBorders>
);

const Loading: React.FC = () => (
  <div aria-busy data-testid="infinite-list-skeleton-loading">
    <SkeletonItem height={height} />
    <SkeletonItem height={height} />
    <SkeletonItem height={height} />
    <SkeletonItem height={height} />
    <SkeletonItem height={height} />
    <SkeletonItem height={height} />
  </div>
);

const GroupLabel = styled(Typography)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  background: theme.palette.common.white,
  marginTop: theme.spacing(2),
  padding: theme.spacing(0, 2),
}));

export interface InfiniteListProps<T, C> {
  loading: boolean;
  disableHover?: boolean;
  EmptyPlaceholder?: ReactElement | null;
  ItemOverride?: React.ComponentType<ItemProps> | null;
  itemContent: ItemContent<T, C>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  groupBy?: (item: T) => { label: string; order?: number };
}

export const InfiniteList = <T, C>({
  loading,
  disableHover = false,
  data = [],
  EmptyPlaceholder = null,
  ItemOverride = null,
  context,
  groupBy,
  itemContent,
  ...props
}: Omit<GroupedVirtuosoProps<T, C>, 'groupCounts' | 'itemContent'> &
  InfiniteListProps<T, C>): ReactElement => {
  const { groupCounts, groupLabels, items } = useMemo(
    () => groupItems(data, groupBy),
    [data, groupBy],
  );

  const Item: React.ComponentType<ItemProps> = useCallback(
    (props) => (
      <ItemWithBorders disableGutters disableHover={disableHover} {...props} />
    ),
    [disableHover],
  );

  const commonProps: Omit<VirtuosoProps<T, C>, 'itemContent'> = {
    ...props,
    components: {
      Footer: loading ? Loading : undefined,
      EmptyPlaceholder: loading ? undefined : () => EmptyPlaceholder,
      List: ListContainer,
      Item: ItemOverride ?? Item,
      ScrollSeekPlaceholder: SkeletonItem,
      ...props.components,
    },
    scrollSeekConfiguration: {
      enter: (velocity) => Math.abs(velocity) > 2000,
      exit: (velocity) => Math.abs(velocity) < 100,
      ...props.scrollSeekConfiguration,
    },
    overscan: 2000,
  };

  if (groupCounts.length > 0) {
    return (
      <GroupedVirtuoso
        groupCounts={groupCounts}
        groupContent={(index) => (
          <GroupLabel variant="h5">{groupLabels[index]}</GroupLabel>
        )}
        itemContent={(index) =>
          items[index] && itemContent(index, items[index], context)
        }
        {...commonProps}
      />
    );
  } else {
    return (
      <Virtuoso
        data={items}
        itemContent={(index) =>
          items[index] && itemContent(index, items[index], context)
        }
        {...commonProps}
      />
    );
  }
};
