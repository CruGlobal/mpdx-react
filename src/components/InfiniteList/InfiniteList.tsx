import React, { ReactElement } from 'react';
import { List, ListItem, styled, Theme, Typography } from '@material-ui/core';
import {
  ListProps,
  ItemProps,
  GroupedVirtuoso,
  GroupedVirtuosoProps,
  ItemContent,
} from 'react-virtuoso';
import { Skeleton } from '@material-ui/lab';

const height = 72;
const padding = 0;

// eslint-disable-next-line react/display-name
const ListContainer: React.ComponentType<ListProps> = React.forwardRef(
  (props, listRef) => (
    <List component="div" disablePadding {...props} ref={listRef} />
  ),
);

const ItemWithBorders = styled(({ disableHover: _, ...props }) => (
  <ListItem disableGutters {...props} />
))(
  ({
    theme,
    disableHover = false,
  }: {
    theme: Theme;
    disableHover?: boolean;
  }) => ({
    padding: `${padding}px`,
    '&:first-child': {
      marginTop: '20px',
    },
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
  }),
);

const Item: React.ComponentType<ItemProps> = (props) => (
  <ItemWithBorders {...props} />
);

const SkeletonItem: React.FC<{ height: number }> = ({ height }) => (
  <ItemWithBorders disableHover>
    <Skeleton variant="rect" height={height - padding * 2} />
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
}));

interface InfiniteListProps<T> {
  loading: boolean;
  EmptyPlaceholder: ReactElement;
  itemContent: ItemContent<T>;
  totalCount?: number;
  groupBy?: (item: T) => string;
}

export const InfiniteList = <T,>({
  loading,
  data = [],
  totalCount = data?.length ?? 0,
  EmptyPlaceholder,
  groupBy,
  ...props
}: Omit<GroupedVirtuosoProps<T>, 'groupCounts' | 'itemContent'> &
  InfiniteListProps<T>): ReactElement => {
  const groups =
    data?.length > 0
      ? groupBy
        ? data.reduce<{ [groupLabel: string]: number }>((acc, item) => {
            const label = groupBy(item);
            return {
              ...acc,
              [label]: acc[label] ? acc[label] + 1 : 1,
            };
          }, {})
        : { '': totalCount }
      : {};

  return (
    <GroupedVirtuoso
      groupCounts={Object.values(groups)}
      {...props}
      itemContent={(index) =>
        data[index] && props.itemContent(index, data[index])
      }
      groupContent={(index) => {
        const groupLabel = Object.keys(groups)[index];
        return groupLabel ? (
          <GroupLabel variant="h5">{groupLabel}</GroupLabel>
        ) : null;
      }}
      components={{
        Footer: loading ? Loading : undefined,
        EmptyPlaceholder: loading ? undefined : () => EmptyPlaceholder,
        List: ListContainer,
        Item,
        ScrollSeekPlaceholder: SkeletonItem,
        ...props.components,
      }}
      scrollSeekConfiguration={{
        enter: (velocity) => Math.abs(velocity) > 200,
        exit: (velocity) => Math.abs(velocity) < 10,
        ...props.scrollSeekConfiguration,
      }}
    />
  );
};
