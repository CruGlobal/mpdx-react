import { Box, IconButton, styled } from '@material-ui/core';
import React from 'react';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from '../../../../../graphql/types.generated';
import { StarredItemIcon } from '../../../common/StarredItemIcon/StarredItemIcon';

const StarIconWrap = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  marginRight: theme.spacing(1),
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
