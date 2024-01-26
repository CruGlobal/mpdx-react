import React from 'react';
import Icon from '@mui/icons-material/Language';
import { IconButton } from '@mui/material';
import * as Types from 'src/graphql/types.generated';

interface Props {
  url: Types.Website['url'];
}

export const Website: React.FC<Props> = ({ url }) => {
  if (!url) return null;
  return (
    <IconButton target="_blank" href={url} rel="noreferrer">
      <Icon color="primary" />
    </IconButton>
  );
};
