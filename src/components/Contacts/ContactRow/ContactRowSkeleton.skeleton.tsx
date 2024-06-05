import React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Box,
  ButtonBase,
  Grid,
  Hidden,
  IconButton,
  ListItemIcon,
  ListItemSecondaryAction,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { InfiniteListRowSkeletonProps } from 'src/components/InfiniteList/InfiniteList';
import { StarredItemIcon } from 'src/components/common/StarredItemIcon/StarredItemIcon';
import theme from 'src/theme';

const ListItemButton = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'isFirst',
})<{ isFirst?: boolean }>(({ isFirst }) => ({
  flex: '1 1 auto',
  textAlign: 'left',
  marginTop: isFirst ? '16px' : '0',
  padding: theme.spacing(0, 0.5, 0, 2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 0.5),
  },
}));

export const ContactRowSkeleton: React.FC<InfiniteListRowSkeletonProps> =
  // eslint-disable-next-line react/display-name
  React.memo(({ isFirst }) => {
    return (
      <ListItemButton
        isFirst={isFirst}
        style={{ width: '100%', marginBottom: '5px' }}
      >
        <Hidden xsDown>
          <ListItemIcon>
            <Skeleton width={30} height={42} variant={'rounded'} />
          </ListItemIcon>
        </Hidden>
        <Grid container alignItems="center">
          <Grid item xs={10} md={6} style={{ paddingRight: 16 }}>
            <Skeleton
              width={'100%'}
              height={42}
              style={{ maxWidth: '300px' }}
            />
            <Skeleton
              width={'100%'}
              height={20}
              style={{ maxWidth: '360px' }}
            />
          </Grid>
          <Grid item xs={2} md={6}>
            <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
              <Skeleton width={'32px'} height={42} />
              <Skeleton
                width={'100%'}
                height={42}
                style={{ maxWidth: '250px', marginLeft: '10px' }}
              />
            </div>
          </Grid>
        </Grid>
        <Hidden xsDown>
          <Box>
            <Box display="flex" alignItems="center" px={5}>
              <CheckCircleOutlineIcon
                sx={{
                  color: 'cruGrayMedium.main',
                  '&:hover': {
                    color: 'cruGrayDark.main',
                  },
                }}
              />
              <Box ml={2}>
                <Skeleton width={15} height={42} />
              </Box>
            </Box>
          </Box>
          <ListItemSecondaryAction
            style={{ position: 'static', top: 0, transform: 'none' }}
          >
            <IconButton component="div">
              <StarredItemIcon isStarred={false} />
            </IconButton>
          </ListItemSecondaryAction>
        </Hidden>
      </ListItemButton>
    );
  });
