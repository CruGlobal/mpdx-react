import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
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
      optimisticResponse: {
        updateTask: {
          __typename: 'TaskUpdateMutationPayload',
          task: {
            __typename: 'Task',
            id: taskId,
            starred: !isStarred,
          },
        },
      },
    });
  };

  return (
    <StarButton onClick={toggleStarred}>
      <StarredItemIcon isStarred={isStarred} />
    </StarButton>
  );
};
