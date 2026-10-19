import React from 'react';
import { mdiHistory } from '@mdi/js';
import Icon from '@mdi/react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NullStateBox } from 'src/components/Shared/Filters/NullState/NullStateBox';

interface AddressChangeEmptyStateProps {
  filtered: boolean;
}

export const AddressChangeEmptyState: React.FC<
  AddressChangeEmptyStateProps
> = ({ filtered }) => {
  const { t } = useTranslation();

  return (
    <NullStateBox data-testid="address-changes-null-state">
      <Icon path={mdiHistory} size={1.5} />
      <Typography variant="h5">
        {filtered
          ? t('No address changes match your filters')
          : t('No address changes available yet')}
      </Typography>
      <Typography my={1}>
        {filtered
          ? t('Try changing your filters.')
          : t('Address changes for your partners will appear here.')}
      </Typography>
    </NullStateBox>
  );
};
