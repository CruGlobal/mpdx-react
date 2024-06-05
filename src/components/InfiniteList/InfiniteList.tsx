import React, { ReactElement, useMemo } from 'react';
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

export interface InfiniteListRowSkeletonProps {
  isFirst?: boolean;
}

const Item: React.ComponentType<ItemProps<any>> = (props) => (
  <ItemWithBorders disableGutters {...props} />
);

const SkeletonItem: React.FC<{ height: number }> = ({ height }) => (
  <ItemWithBorders disableGutters disableHover>
    <Skeleton variant="rectangular" height={height - padding * 2} />
  </ItemWithBorders>
);

type LoadingProps = {
  Skeleton: React.FC<InfiniteListRowSkeletonProps> | null;
  numberOfSkeletons: number;
};
const Loading: React.FC<LoadingProps> = ({ Skeleton, numberOfSkeletons }) => (
  <div aria-busy data-testid="infinite-list-skeleton-loading">
    {[...Array(numberOfSkeletons).keys()].map((value) => {
      return Skeleton ? (
        <Skeleton key={value} isFirst={value === 0} />
      ) : (
        <SkeletonItem height={height} key={value} />
      );
    })}
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
  Skeleton?: React.FC | null;
  numberOfSkeletons?: number;
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
  Skeleton = null,
  numberOfSkeletons = 6,
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
      Footer: loading
        ? () => Loading({ Skeleton, numberOfSkeletons })
        : undefined,
      EmptyPlaceholder: loading ? undefined : () => EmptyPlaceholder,
      List: ListContainer,
      Item,
      ScrollSeekPlaceholder: Skeleton ? Skeleton : SkeletonItem,
      ...props.components,
    },
    scrollSeekConfiguration: {
      enter: (velocity) => Math.abs(velocity) > 200,
      exit: (velocity) => Math.abs(velocity) < 10,
      ...props.scrollSeekConfiguration,
    },
  };

  return (
    <React.Fragment>
      {loading && !items.length && (
        <Loading Skeleton={Skeleton} numberOfSkeletons={numberOfSkeletons} />
      )}

      {!!!groupCounts.length && (
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
      )}
      {!!groupCounts.length && (
        <Virtuoso
          data={items}
          itemContent={(index) =>
            items[index] && itemContent(index, items[index], context)
          }
          {...commonProps}
        />
      )}
    </React.Fragment>
  );
};
