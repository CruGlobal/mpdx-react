import React, { useMemo } from 'react';
import Icon from '@mui/icons-material/Twitter';
import { IconButton } from '@mui/material';
import * as Types from 'src/graphql/types.generated';

interface Props {
  screenName: Types.TwitterAccount['screenName'];
}

export const Twitter: React.FC<Props> = ({ screenName }) => {
  if (!screenName) return null;

  const url = useMemo(
    () => `http://www.twitter.com/${screenName}`,
    [screenName],
  );

  return (
    <IconButton target="_blank" href={url} rel="noreferrer">
      <Icon color="primary" />
    </IconButton>
  );
};
