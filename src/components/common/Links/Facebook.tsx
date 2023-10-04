import Link from 'next/link';
import React, { useMemo } from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import { IconButton } from '@mui/material';
import * as Types from '../../../../graphql/types.generated';

interface Props {
  account: Pick<Types.FacebookAccount, 'id' | 'username'>;
}

export const Facebook: React.FC<Props> = ({ account }) => {
  if (!account) return null;

  const url = useMemo(
    () => `http://www.facebook.com/${account.username}`,
    [account],
  );

  return (
    <Link href={url} key={account.id}>
      <IconButton>
        <FacebookIcon color="primary" />
      </IconButton>
    </Link>
  );
};
