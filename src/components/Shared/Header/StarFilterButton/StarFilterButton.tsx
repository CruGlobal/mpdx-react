import React from 'react';
import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { StarredItemIcon } from '../../../common/StarredItemIcon/StarredItemIcon';

const StarIconWrap = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

interface StarFilterButtonProps {
  starredFilter: boolean;
  toggleStarredFilter: (starred: boolean) => void;
}

export const StarFilterButton: React.FC<StarFilterButtonProps> = ({
  starredFilter,
  toggleStarredFilter,
}) => {
  return (
    <StarIconWrap>
      <IconButton
        data-testid="star-filter-button"
        onClick={() => toggleStarredFilter(!starredFilter)}
      >
        <StarredItemIcon isStarred={starredFilter} />
      </IconButton>
    </StarIconWrap>
  );
};
