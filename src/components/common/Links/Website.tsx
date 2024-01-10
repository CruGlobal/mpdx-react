import React from 'react';
import Icon from '@mui/icons-material/Language';
import { IconButton } from '@mui/material';
import * as Types from 'src/graphql/types.generated';

interface Props {
  account: Pick<Types.Website, 'id' | 'url'>;
}

export const Website: React.FC<Props> = ({ account }) => {
  if (!account?.url) return null;
  return (
    <IconButton
      target="_blank"
      href={account?.url}
      key={account.id}
      rel="noreferrer"
    >
      <Icon color="primary" />
    </IconButton>
  );
};
