import React from 'react';
import { IconButton, IconButtonTypeMap } from '@mui/material';
import { StarredItemIcon } from '../../common/StarredItemIcon/StarredItemIcon';
import { useSetContactStarredMutation } from './SetContactStarred.generated';

interface Props {
  accountListId: string;
  contactId: string;
  isStarred: boolean;
  size?: IconButtonTypeMap['props']['size'];
}

export const StarContactIconButton: React.FC<Props> = ({
  accountListId,
  contactId,
  isStarred,
  size = 'medium',
}) => {
  const [setContactStarred] = useSetContactStarredMutation();

  return (
    <IconButton
      size={size}
      component="div"
      onClick={(event) => {
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
      }}
    >
      <StarredItemIcon isStarred={isStarred} />
    </IconButton>
  );
};
