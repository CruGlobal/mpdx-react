import Link from 'next/link';
import React from 'react';
import Icon from '@mui/icons-material/Language';
import { IconButton } from '@mui/material';
import * as Types from '../../../../graphql/types.generated';

interface Props {
  account: Pick<Types.Website, 'id' | 'url'>;
}

export const Website: React.FC<Props> = ({ account }) => {
  if (!account?.url) return null;
  return (
    <Link href={account?.url} key={account.id}>
      <IconButton>
        <Icon color="primary" />
      </IconButton>
    </Link>
  );
};
