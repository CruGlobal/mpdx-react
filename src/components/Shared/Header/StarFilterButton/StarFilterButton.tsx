import { Box, IconButton, styled } from '@material-ui/core';
import React from 'react';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from '../../../../../graphql/types.generated';
import { StarredItemIcon } from '../../../common/StarredItemIcon/StarredItemIcon';

const StarIconWrap = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const StarIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
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
      <StarIconButton
        data-testid="star-filter-button"
        onClick={() =>
          toggleStarredFilter(starredFilter.starred ? {} : { starred: true })
        }
      >
        <StarredItemIcon isStarred={starredFilter.starred || false} />
      </StarIconButton>
    </StarIconWrap>
  );
};
