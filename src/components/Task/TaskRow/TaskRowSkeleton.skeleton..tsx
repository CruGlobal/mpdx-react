import React from 'react';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { Box, Hidden, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TaskCommentIcon,
  TaskRowWrap,
} from 'src/components/Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCommentsButton/TaskCommentsButton';
import { DeletedItemIcon } from 'src/components/common/DeleteItemIcon/DeleteItemIcon';
import { StarredItemIcon } from 'src/components/common/StarredItemIcon/StarredItemIcon';
import theme from 'src/theme';

const TaskRowSkeletonWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: theme.spacing(1),
}));

const TaskCalendarIcon = styled(CalendarToday)(() => ({
  width: 20,
  height: 20,
  color: theme.palette.text.secondary,
}));

const TaskCommentNumber = styled(Typography)(() => ({
  color: theme.palette.text.primary,
  margin: theme.spacing(0.5),
}));

const ContactRowButton = styled(Box)(() => ({
  height: '56px',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  alignContent: 'center',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: '0',
}));

export const TaskRowSkeleton: React.FC = () => (
  <Box role="row" p={1}>
    <ContactRowButton display="flex" alignItems="center">
      <Box
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <Hidden xsDown>
          <Skeleton width={'100%'} height={40} style={{ maxWidth: '42px' }} />
        </Hidden>
        <Skeleton
          width={'100%'}
          height={40}
          style={{ maxWidth: '64px', margin: '16px' }}
        />
        <Skeleton width={'100%'} height={40} style={{ maxWidth: '250px' }} />
        <Skeleton
          width={'100%'}
          height={40}
          style={{ maxWidth: '110px', marginLeft: '10px' }}
        />

        <Hidden smUp>
          <Skeleton width={'100%'} height={40} style={{ maxWidth: '80px' }} />
        </Hidden>
      </Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Hidden smDown>
          <Skeleton width={'90px'} height={40} />
          <TaskRowSkeletonWrap>
            <TaskCalendarIcon />
            <Skeleton
              width={'50px'}
              height={40}
              style={{ marginLeft: '5px' }}
            />
          </TaskRowSkeletonWrap>

          <Box sx={{ marginRight: '16px' }}>
            <TaskRowWrap>
              <TaskCommentIcon titleAccess="Comment Icon" small={false} />
              <TaskCommentNumber>0</TaskCommentNumber>
            </TaskRowWrap>
          </Box>
        </Hidden>
        <Hidden smUp>
          <Box sx={{ width: '96px', paddingLeft: '10px' }}>
            <Skeleton width={'100%'} height={25} />
            <Skeleton width={'100%'} height={40} />
          </Box>
        </Hidden>
        <Hidden smDown>
          <Box width={40}>
            <DeletedItemIcon />
          </Box>
          <Box width={40}>
            <StarredItemIcon isStarred={false} />
          </Box>
        </Hidden>
      </Box>
    </ContactRowButton>
  </Box>
);
