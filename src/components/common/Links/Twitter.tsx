import React from 'react';
import Icon from '@mui/icons-material/Twitter';
import { IconButton } from '@mui/material';
import * as Types from 'src/graphql/types.generated';

interface Props {
  screenName: Types.TwitterAccount['screenName'];
}

export const Twitter: React.FC<Props> = ({ screenName }) => {
  if (!screenName) return null;

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
