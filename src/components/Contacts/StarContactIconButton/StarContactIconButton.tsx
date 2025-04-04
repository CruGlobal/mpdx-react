import React from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StarredItemIcon } from '../../common/StarredItemIcon/StarredItemIcon';
import { useSetContactStarredMutation } from './SetContactStarred.generated';

interface Props {
  accountListId: string;
  contactId: string;
  isStarred: boolean;
  size?: IconButtonProps['size'];
}

export const StarContactIconButton: React.FC<Props> = ({
  accountListId,
  contactId,
  isStarred,
  size = 'medium',
}) => {
  const { t } = useTranslation();
  const [setContactStarred] = useSetContactStarredMutation();

  return (
    <IconButton
      aria-label={isStarred ? t('Remove star') : t('Add star')}
      size={size}
      onClick={(event) => {
        event.preventDefault();
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
