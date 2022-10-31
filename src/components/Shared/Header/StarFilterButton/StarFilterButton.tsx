import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import React from 'react';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from '../../../../../graphql/types.generated';
import { StarredItemIcon } from '../../../common/StarredItemIcon/StarredItemIcon';

const StarIconWrap = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

interface StarFilterButtonProps {
  starredFilter: ContactFilterSetInput | TaskFilterSetInput;
  toggleStarredFilter: (
    filter: ContactFilterSetInput | TaskFilterSetInput,
  ) => void;
}

export const StarFilterButton: React.FC<StarFilterButtonProps> = ({
  starredFilter,
  toggleStarredFilter,
}) => {
  return (
    <StarIconWrap>
      <IconButton
        data-testid="star-filter-button"
        onClick={() =>
          toggleStarredFilter(starredFilter.starred ? {} : { starred: true })
        }
      >
        <StarredItemIcon isStarred={starredFilter.starred || false} />
      </IconButton>
    </StarIconWrap>
  );
};
