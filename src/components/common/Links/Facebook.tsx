import React, { useMemo } from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import { IconButton } from '@mui/material';
import * as Types from 'src/graphql/types.generated';

interface Props {
  username: Types.FacebookAccount['username'];
}

export const Facebook: React.FC<Props> = ({ username }) => {
  if (!username) return null;

  const url = useMemo(() => `https://www.facebook.com/${username}`, [username]);

  return (
    <IconButton target="_blank" href={url} rel="noreferrer">
      <FacebookIcon color="primary" />
    </IconButton>
  );
};
