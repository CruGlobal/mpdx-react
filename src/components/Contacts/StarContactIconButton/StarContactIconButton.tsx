import React, { useMemo } from 'react';
import { IconButton } from '@mui/material';
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

  const handleIconClick = useMemo(
    () => (event) => {
      event.preventDefault();
      event.stopPropagation();
      setContactStarred({
        variables: { accountListId, contactId, starred: !isStarred },
        optimisticResponse: {
          updateContact: {
            __typename: 'ContactUpdateMutationPayload',
            contact: {
              __typename: 'Contact',
              id: contactId,
              starred: !isStarred,
            },
          },
        },
      });
    },
    [accountListId, contactId, isStarred],
  );

  return (
    <IconButton component="div" onClick={handleIconClick}>
      <StarredItemIcon isStarred={isStarred} />
    </IconButton>
  );
};
