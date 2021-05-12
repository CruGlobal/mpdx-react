import { IconButton, styled } from '@material-ui/core';
import React from 'react';
import { StarredItemIcon } from '../../common/StarredItemIcon';
import { useSetContactStarredMutation } from './SetContactStarred.generated';

interface Props {
  accountListId: string;
  contactId: string;
}

const StarButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(1),
}));

export const StarContactIconButton: React.FC<Props> = ({
  accountListId,
  contactId,
}) => {
  const [setContactStarred, { data }] = useSetContactStarredMutation();

  const isStarred = data?.updateContact?.contact.starred || false;

  const toggleStarred = async () => {
    setContactStarred({
      variables: { accountListId, contactId, starred: !isStarred },
    });
  };

  return (
    <StarButton onClick={toggleStarred}>
      <StarredItemIcon isStarred={isStarred} />
    </StarButton>
  );
};
