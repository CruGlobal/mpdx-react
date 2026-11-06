import React from 'react';
import { mdiHistory } from '@mdi/js';
import Icon from '@mdi/react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NullStateBox } from 'src/components/Shared/Filters/NullState/NullStateBox';

// 'defaultRange': only the page's default Last 12 Months range is applied
export type AddressChangeFilter = 'none' | 'defaultRange' | 'other';

interface AddressChangeEmptyStateProps {
  filter: AddressChangeFilter;
}

export const AddressChangeEmptyState: React.FC<
  AddressChangeEmptyStateProps
> = ({ filter }) => {
  const { t } = useTranslation();
  const anyTime = t('Any time');
  const changedDuring = t('Changed during');

  const messages: Record<AddressChangeFilter, [string, string]> = {
    none: [
      t('No address changes available yet'),
      t('Address changes for your partners will appear here.'),
    ],
    defaultRange: [
      t('No address changes in the last 12 months'),
      t('Choose "{{option}}" under {{filter}} to see older changes.', {
        option: anyTime,
        filter: changedDuring,
      }),
    ],
    other: [
      t('No address changes match your filters'),
      t('Try changing your filters.'),
    ],
  };
  const [title, text] = messages[filter];

  return (
    <NullStateBox data-testid="address-changes-null-state" role="status">
      <Icon path={mdiHistory} size={1.5} />
      <Typography variant="h5">{title}</Typography>
      <Typography my={1}>{text}</Typography>
    </NullStateBox>
  );
};
