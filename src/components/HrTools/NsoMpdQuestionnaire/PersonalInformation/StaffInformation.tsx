import React, { useState } from 'react';
import { Stack, TextField, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { getLocalizedAssignmentStatus } from 'src/lib/functions/getLocalizedAssignmentStatus';
import { StaffInfoCard } from '../../Shared/StaffInfoCard/StaffInfoCard';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';

export const StaffInformation: React.FC = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse } = useNsoMpdQuestionnaire();
  const { data: userData } = useGetUserQuery();

  const [viewingSpouse, setViewingSpouse] = useState(false);

  const staffInfo = (viewingSpouse ? hcmSpouse : hcmUser)?.staffInfo;
  const otherStaffInfo = (viewingSpouse ? hcmUser : hcmSpouse)?.staffInfo;

  const name =
    [staffInfo?.preferredName, staffInfo?.lastName].filter(Boolean).join(' ') ||
    t('User');
  const toggleName =
    otherStaffInfo?.preferredName ??
    (viewingSpouse ? t('Yourself') : t('Spouse'));

  const fields = [
    {
      label: t('Staff Status'),
      value: getLocalizedAssignmentStatus(t, staffInfo?.assignmentStatus),
    },
    {
      label: t('Family Status'),
      value: !!hcmSpouse ? t('Married') : t('Single'),
    },
    { label: t('Age'), value: staffInfo?.age?.toString() ?? '' },
    { label: t('Tenure'), value: staffInfo?.tenure?.toString() ?? '' },
    {
      label: t('Address'),
      value: [
        staffInfo?.addressLine1,
        staffInfo?.addressLine2,
        staffInfo?.city,
        [staffInfo?.state, staffInfo?.zipCode].filter(Boolean).join(' '),
      ]
        .filter(Boolean)
        .join(', '),
    },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t('Staff Information')}</Typography>
      <Typography>
        <Trans t={t}>
          Take a moment to verify the staff information we have on record. If
          something is incorrect, please inform your MPD coordinator during New
          Staff Orientation and they will make a correction.
        </Trans>
      </Typography>
      <StaffInfoCard
        person={{
          name,
          // Backend doesn't currently support accessing the spouse's avatar
          avatarSrc: viewingSpouse ? null : userData?.user.avatar,
          staffAccountId: userData?.user.staffAccountId,
        }}
        toggle={
          hcmSpouse
            ? {
                name: toggleName,
                onClick: () => setViewingSpouse((prev) => !prev),
              }
            : undefined
        }
      >
        <Stack spacing={2}>
          {fields.map((field) => (
            <TextField
              key={field.label}
              label={field.label}
              value={field.value}
              // readOnly instead of disabled purely for accessibility
              InputProps={{ readOnly: true }}
              size="small"
            />
          ))}
        </Stack>
      </StaffInfoCard>
    </Stack>
  );
};
