import React from 'react';
import Icon from '@mui/icons-material/Twitter';
import { IconButton } from '@mui/material';
import { TwitterAccount } from 'src/graphql/types.generated';

interface Props {
  screenName: TwitterAccount['screenName'];
}

export const Twitter: React.FC<Props> = ({ screenName }) => {
  if (!screenName) {
    return null;
  }

  return (
    <IconButton
      target="_blank"
      href={`https://www.twitter.com/${screenName}`}
      rel="noreferrer"
    >
      <Icon color="primary" />
    </IconButton>
  );
};
