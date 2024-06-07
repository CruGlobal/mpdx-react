import React from 'react';
import styled from '@emotion/styled';
import { Box, IconButton, Skeleton } from '@mui/material';
import { StarredItemIcon } from 'src/components/common/StarredItemIcon/StarredItemIcon';
import theme from '../../../../theme';
import { DraggableBox } from './ContactFlowRow';

export const StyledBox = styled(Box)(() => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
}));

export const ContactFlowRowSkeleton: React.FC = () => {
  return (
    <Box
      display="flex"
      width="100%"
      style={{
        background: 'white',
      }}
    >
      <DraggableBox>
        <Box display="flex" alignItems="center" width="100%">
          <Skeleton
            width={theme.spacing(4)}
            height={theme.spacing(4)}
            variant={'rounded'}
          />

          <StyledBox ml={2} draggable>
            <Skeleton
              width={'100%'}
              height={30}
              style={{ maxWidth: '360px' }}
            />
            <Skeleton
              width={'100%'}
              height={20}
              style={{ maxWidth: '180px' }}
            />
          </StyledBox>
        </Box>
        <Box display="flex">
          <IconButton component="div">
            <StarredItemIcon isStarred={false} />
          </IconButton>
        </Box>
      </DraggableBox>
    </Box>
  );
};
