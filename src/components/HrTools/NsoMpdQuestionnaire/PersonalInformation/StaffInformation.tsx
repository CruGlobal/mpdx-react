import React, { useState } from 'react';
import { Stack, TextField, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { getLocalizedAge } from 'src/lib/functions/getLocalizedAge';
import { StaffInfoCard } from '../../Shared/StaffInfoCard/StaffInfoCard';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';

export const StaffInformation: React.FC = () => {
  const { t } = useTranslation();
  const { questionnaire } = useNsoMpdQuestionnaire();
  const { data: userData } = useGetUserQuery();

  const [viewingSpouse, setViewingSpouse] = useState(false);

  const maritalStatus = questionnaire?.maritalStatus;
  const hasSpouse =
    !!maritalStatus &&
    maritalStatus !== NewStaffQuestionnaireMaritalStatusEnum.Single;

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
    otherFirstName ?? (viewingSpouse ? t('Yourself') : t('Spouse'));

  const fields = [
    {
      label: t('Staff Status'),
      value: staffStatus,
    },
    {
      label: t('Family Status'),
      value: hasSpouse ? t('Married') : t('Single'),
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
    },
    { label: t('Address'), value: questionnaire?.address ?? '' },
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
          staffAccountId: viewingSpouse
            ? questionnaire?.spousePersonNumber
            : questionnaire?.personNumber,
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
