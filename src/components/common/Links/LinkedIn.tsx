import React from 'react';
import Icon from '@mui/icons-material/LinkedIn';
import { IconButton } from '@mui/material';
import { LinkedinAccount } from 'src/graphql/types.generated';

interface Props {
  publicUrl: LinkedinAccount['publicUrl'];
}

export const LinkedIn: React.FC<Props> = ({ publicUrl }) => {
  if (!publicUrl) return null;

  return (
    <IconButton target="_blank" href={publicUrl} rel="noreferrer">
      <Icon color="primary" />
    </IconButton>
  );
};
