import React from 'react';
import HistoryIcon from '@mui/icons-material/History';
import { Chip } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { isAutomaticChange } from 'src/components/Shared/AddressHistoryModal/addressHistoryHelpers';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat, dateFormatWithoutYear } from 'src/lib/intlFormat';
import { sourceToStr } from 'src/lib/sourceHelper';
import { AddressChangeFieldsFragment } from './AddressChangeBadge.generated';

export interface AddressChangeBadgeProps {
  addressChange: AddressChangeFieldsFragment;
}

export const AddressChangeBadge: React.FC<AddressChangeBadgeProps> = ({
  addressChange: { date: changeDate, source, createdByUser },
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data } = useGetUserQuery();

  const changedOn = DateTime.fromISO(changeDate);
  const date =
    changedOn.year === DateTime.now().year
      ? dateFormatWithoutYear(changedOn, locale)
      : dateFormat(changedOn, locale);
  const madeBy = isAutomaticChange(source)
    ? t('automatic')
    : !createdByUser
      ? t('in {{appName}}', { appName: sourceToStr(t, source) })
      : createdByUser.id === data?.user.id
        ? t('by you')
        : t('other user');

  return (
    <Chip
      icon={<HistoryIcon fontSize="small" color="inherit" />}
      label={t('Address changed {{date}} · {{madeBy}}', { date, madeBy })}
      size="small"
      sx={{
        mt: 0.5,
        backgroundColor: 'mpdxBlue.light',
        color: 'mpdxBlue.main',
      }}
    />
  );
};
