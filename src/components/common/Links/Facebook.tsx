import React, { useMemo } from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import { IconButton } from '@mui/material';
import * as Types from 'src/graphql/types.generated';

interface Props {
  account: Pick<Types.FacebookAccount, 'id' | 'username'>;
}

export const Facebook: React.FC<Props> = ({ account }) => {
  if (!account) return null;

  const url = useMemo(
    () => `https://www.facebook.com/${account.username}`,
    [account],
  );

  return (
    <IconButton target="_blank" href={url} key={account.id} rel="noreferrer">
      <FacebookIcon color="primary" />
    </IconButton>
  );
};
