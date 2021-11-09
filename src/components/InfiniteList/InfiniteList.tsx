import React, { ReactElement } from 'react';
import { List, ListItem, styled, Theme } from '@material-ui/core';
import { ListProps, ItemProps, Virtuoso, VirtuosoProps } from 'react-virtuoso';
import { Skeleton } from '@material-ui/lab';

const height = 72;
const padding = 0;

// eslint-disable-next-line react/display-name
const ListContainer: React.ComponentType<ListProps> = React.forwardRef(
  (props, listRef) => <List component="div" {...props} ref={listRef} />,
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
interface InfiniteListProps {
  loading: boolean;
  EmptyPlaceholder: ReactElement;
}

export const InfiniteList = <T,>({
  loading,
  data = [],
  totalCount = data?.length ?? 0,
  EmptyPlaceholder,
  ...props
}: InfiniteListProps & VirtuosoProps<T>): ReactElement => (
  <Virtuoso
    data={data}
    totalCount={totalCount}
    {...props}
    components={{
      Footer: loading ? Loading : undefined,
      EmptyPlaceholder: loading ? undefined : () => EmptyPlaceholder,
      List: ListContainer,
      Item,
      ScrollSeekPlaceholder: SkeletonItem,
      ...props.components,
    }}
    scrollSeekConfiguration={{
      enter: (velocity) => Math.abs(velocity) > 50,
      exit: (velocity) => Math.abs(velocity) < 10,
      ...props.scrollSeekConfiguration,
    }}
  />
);
