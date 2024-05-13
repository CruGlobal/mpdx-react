import React from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import { IconButton } from '@mui/material';
import { FacebookAccount } from 'src/graphql/types.generated';

interface Props {
  username: FacebookAccount['username'];
}

export const Facebook: React.FC<Props> = ({ username }) => {
  if (!username) {
    return null;
  }

  return (
    <IconButton
      target="_blank"
      href={`https://www.facebook.com/${username}`}
      rel="noreferrer"
    >
      <FacebookIcon color="primary" />
    </IconButton>
  );
};
