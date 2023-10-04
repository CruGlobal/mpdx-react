import Link from 'next/link';
import React, { useMemo } from 'react';
import Icon from '@mui/icons-material/Twitter';
import { IconButton } from '@mui/material';
import * as Types from '../../../../graphql/types.generated';

interface Props {
  account: Pick<Types.TwitterAccount, 'id' | 'screenName'>;
}

export const Twitter: React.FC<Props> = ({ account }) => {
  if (!account?.screenName) return null;

  const url = useMemo(
    () => `http://www.twitter.com/${account.screenName}`,
    [account],
  );

  return (
    <Link href={url} key={account.id}>
      <IconButton>
        <Icon color="primary" />
      </IconButton>
    </Link>
  );
};
