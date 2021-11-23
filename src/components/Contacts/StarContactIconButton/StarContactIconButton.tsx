import { IconButton } from '@material-ui/core';
import React from 'react';
import { StarredItemIcon } from '../../common/StarredItemIcon/StarredItemIcon';
import { useSetContactStarredMutation } from './SetContactStarred.generated';

interface Props {
  accountListId: string;
  contactId: string;
  isStarred: boolean;
}

export const StarContactIconButton: React.FC<Props> = ({
  accountListId,
  contactId,
  isStarred,
}) => {
  const [setContactStarred] = useSetContactStarredMutation();

  return (
    <IconButton
      onClick={(event) => {
        event.stopPropagation();
        setContactStarred({
          variables: { accountListId, contactId, starred: !isStarred },
        });
      }}
    >
      <StarredItemIcon isStarred={isStarred} />
    </IconButton>
  );
};
