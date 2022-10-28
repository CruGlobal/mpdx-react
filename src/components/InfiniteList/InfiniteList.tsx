import React, { ReactElement, useEffect, useState } from 'react';
import { Box, List, ListItem, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import {
  ListProps,
  ItemProps,
  GroupedVirtuoso,
  GroupedVirtuosoProps,
  ItemContent,
} from 'react-virtuoso';
import Skeleton from '@mui/material/Skeleton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

const height = 72;
const padding = 0;

// eslint-disable-next-line react/display-name
const ListContainer: React.ComponentType<ListProps> = React.forwardRef(
  (props, listRef) => (
    <List component="div" disablePadding {...props} ref={listRef} />
  ),
);

const ItemWithBorders = styled(ListItem)(
  ({ disableHover = false }: { disableHover?: boolean }) => ({
    padding: `${padding}px`,
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    '&:empty': {
      borderBottom: 'none',
    },
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

const GroupWrapper = styled(Box)(() => ({
  cursor: 'pointer',
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  background: theme.palette.common.white,
}));

const GroupLabel = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(0, 2),
}));

interface InfiniteListProps<T, C> {
  loading: boolean;
  EmptyPlaceholder: ReactElement;
  itemContent: ItemContent<T, C>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  totalCount?: number;
  groupBy?: (item: T) => string;
}

export const InfiniteList = <T, C>({
  loading,
  data = [],
  totalCount = data?.length ?? 0,
  EmptyPlaceholder,
  context,
  groupBy,
  ...props
}: Omit<GroupedVirtuosoProps<T, C>, 'groupCounts' | 'itemContent'> &
  InfiniteListProps<T, C>): ReactElement => {
  const [groups, setGroups] = useState({});

  useEffect(()=>{
    setGroups(data?.length > 0
      ? groupBy
        ? data.reduce<{ [groupLabel: string]: {
          value: number,
          collapse: boolean
        } }>((acc, item) => {
            const label = groupBy(item);
            return {
              ...acc,
              [label]: {
                value: acc[label]?.value ? acc[label].value + 1 : 1,
                collapse: false
              },
            };
          }, {})
        : { '': totalCount }
      : {})
  },[data])

  const collapseGroup = (groupLabel:string) => {
    setGroups({...groups, [groupLabel]: {...groups[groupLabel], collapse: !groups[groupLabel].collapse}})
  }

  const getItemVisibility = (groupIndex: number) => {
    const key = Object.keys(groups)[groupIndex];
    return !groups[key].collapse;
  }

  return (
    <GroupedVirtuoso
      groupCounts={Object.values(groups).map((group) => group.value)}
      {...props}
      itemContent={(index, groupIndex) => {
        return getItemVisibility(groupIndex) ? data[index] && props.itemContent(index, data[index], context) : null
      }
      }
      groupContent={(index) => {
        const groupLabel = Object.keys(groups)[index];
        return groupLabel ? (
          <GroupWrapper display="flex" alignItems="center" width="100%" justifyContent="space-between" onClick={()=>collapseGroup(groupLabel)}>
            <GroupLabel variant="h5" >{groupLabel}</GroupLabel>
            {groups[groupLabel].collapse ? <ExpandMore /> : <ExpandLess />}
          </GroupWrapper>
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
