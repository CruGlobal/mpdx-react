import React from 'react';
import Icon from '@mui/icons-material/LinkedIn';
import { IconButton } from '@mui/material';
import * as Types from 'src/graphql/types.generated';

interface Props {
  account: Pick<Types.LinkedinAccount, 'id' | 'publicUrl'>;
}

export const LinkedIn: React.FC<Props> = ({ account }) => {
  if (!account?.publicUrl) return null;

  return (
    <IconButton
      target="_blank"
      href={account.publicUrl}
      key={account.id}
      rel="noreferrer"
    >
      <Icon color="primary" />
    </IconButton>
  );
};
