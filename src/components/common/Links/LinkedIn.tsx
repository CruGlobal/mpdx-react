import Link from 'next/link';
import React from 'react';
import Icon from '@mui/icons-material/LinkedIn';
import { IconButton } from '@mui/material';
import * as Types from '../../../../graphql/types.generated';

interface Props {
  account: Pick<Types.LinkedinAccount, 'id' | 'publicUrl'>;
}

export const LinkedIn: React.FC<Props> = ({ account }) => {
  if (!account?.publicUrl) return null;

  return (
    <Link href={account.publicUrl} key={account.id}>
      <IconButton>
        <Icon color="primary" />
      </IconButton>
    </Link>
  );
};
