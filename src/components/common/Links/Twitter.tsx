import React, { useMemo } from 'react';
import Icon from '@mui/icons-material/Twitter';
import { IconButton } from '@mui/material';
import * as Types from 'src/graphql/types.generated';

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
    <IconButton target="_blank" href={url} key={account.id} rel="noreferrer">
      <Icon color="primary" />
    </IconButton>
  );
};
