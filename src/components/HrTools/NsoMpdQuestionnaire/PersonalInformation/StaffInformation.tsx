import React, { useState } from 'react';
import { Stack, TextField, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { getLocalizedAge } from 'src/lib/functions/getLocalizedAge';
import { StaffInfoCard } from '../../Shared/StaffInfoCard/StaffInfoCard';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { getFamilyStatusLabel } from '../Shared/helpers/getFamilyStatusLabel';
import { useStaffCardViewer } from './useStaffCardViewer';

interface StaffInfoField {
  label: string;
  value: string;
  helperText?: string;
}

export const StaffInformation: React.FC = () => {
  const { t } = useTranslation();
  const { questionnaire, hasSpouse } = useNsoMpdQuestionnaire();
  const [viewingSpouse, setViewingSpouse] = useState(false);
  const { avatarSrc, otherIsViewer } = useStaffCardViewer(viewingSpouse);

  // Primary user is always new/joining staff
  const isJoining = viewingSpouse ? questionnaire?.spouseJoining : true;

  const staffStatus =
    isJoining === false
      ? t('Already on Staff')
      : isJoining
        ? t('New Staff')
        : '';

  const firstName = viewingSpouse
    ? questionnaire?.spouseFirstName
    : questionnaire?.firstName;
  const otherFirstName = viewingSpouse
    ? questionnaire?.firstName
    : questionnaire?.spouseFirstName;

  const name =
    [firstName, questionnaire?.lastName].filter(Boolean).join(' ') || t('User');
  const toggleName =
    otherFirstName ?? (otherIsViewer ? t('Yourself') : t('Spouse'));

  const fields: StaffInfoField[] = [
    {
      label: t('Staff Status'),
      value: staffStatus,
    },
    {
      label: t('Family Status'),
      value: getFamilyStatusLabel(t, questionnaire?.maritalStatus) ?? '',
    },
    {
      label: t('Age'),
      value: getLocalizedAge(
        t,
        viewingSpouse ? questionnaire?.spouseAge : questionnaire?.age,
      ),
    },
    {
      label: t('Tenure'),
      value:
        (viewingSpouse
          ? questionnaire?.spouseTenure
          : questionnaire?.tenure
        )?.toString() ?? '',
      helperText: t('Talk to your MPD coordinator to update this.'),
    },
    { label: t('Address'), value: questionnaire?.address ?? '' },
    {
      label: t('Cell Phone Number'),
      value:
        (viewingSpouse
          ? questionnaire?.spousePhoneNumber
          : questionnaire?.phoneNumber) ?? '',
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
          avatarSrc,
        }}
        toggle={
          hasSpouse
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
              helperText={field.helperText}
              placeholder={t('Not on record')}
              size="small"
              disabled
              slotProps={{ inputLabel: { shrink: true } }}
            />
          ))}
        </Stack>
      </StaffInfoCard>
    </Stack>
  );
};
