import React, { ReactElement, useMemo } from 'react';
import { List, ListItem, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import {
  ListProps,
  ItemProps,
  GroupedVirtuoso,
  GroupedVirtuosoProps,
  ItemContent,
  Virtuoso,
  VirtuosoProps,
} from 'react-virtuoso';
import Skeleton from '@mui/material/Skeleton';
import { groupItems } from './groupItems';

const height = 72;
const padding = 0;

// eslint-disable-next-line react/display-name
const ListContainer: React.ComponentType<ListProps> = React.forwardRef(
  (props, listRef) => (
    <List component="div" disablePadding {...props} ref={listRef} />
  ),
);

const ItemWithBorders = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'disableHover',
})<{ disableHover?: boolean }>(({ disableHover }) => ({
  padding: `${padding}px`,
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  ...(disableHover
    ? {}
    : {
        '&:hover': {
          backgroundColor: theme.palette.cruGrayLight.main,
        },
      }),
}));

const Item: React.ComponentType<ItemProps> = (props) => (
  <ItemWithBorders disableGutters {...props} />
);

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
  EmptyPlaceholder?: ReactElement | null;
  itemContent: ItemContent<T, C>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  groupBy?: (item: T) => { label: string; order?: number };
}

export const InfiniteList = <T, C>({
  loading,
  data = [],
  EmptyPlaceholder = null,
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

  const commonProps: Omit<VirtuosoProps<T, C>, 'itemContent'> = {
    ...props,
    components: {
      Footer: loading ? Loading : undefined,
      EmptyPlaceholder: loading ? undefined : () => EmptyPlaceholder,
      List: ListContainer,
      Item,
      ScrollSeekPlaceholder: SkeletonItem,
      ...props.components,
    },
    scrollSeekConfiguration: {
      enter: (velocity) => Math.abs(velocity) > 200,
      exit: (velocity) => Math.abs(velocity) < 10,
      ...props.scrollSeekConfiguration,
    },
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
