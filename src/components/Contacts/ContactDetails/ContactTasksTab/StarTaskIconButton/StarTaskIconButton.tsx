import { IconButton, styled } from '@material-ui/core';
import React from 'react';
import { StarredItemIcon } from '../../../../common/StarredItemIcon/StarredItemIcon';
import { useSetTaskStarredMutation } from './SetTaskStarred.generated';

interface Props {
  accountListId: string;
  taskId: string;
  isStarred: boolean;
}

const StarButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(1),
}));

export const StarTaskIconButton: React.FC<Props> = ({
  accountListId,
  taskId,
  isStarred,
}) => {
  const [setTaskStarred] = useSetTaskStarredMutation();

  const toggleStarred = () => {
    setTaskStarred({
      variables: { accountListId, taskId, starred: !isStarred },
    });
  };

  return (
    <StarButton onClick={toggleStarred}>
      <StarredItemIcon isStarred={isStarred} />
    </StarButton>
  );
};
