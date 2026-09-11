import React, { useState } from 'react';
import { Stack, TextField, Typography, styled } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { getLocalizedAge } from 'src/lib/functions/getLocalizedAge';
import { StaffInfoCard } from '../../Shared/StaffInfoCard/StaffInfoCard';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';

const GreyedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.grey[100],
  },
  '& .MuiInputBase-input': {
    cursor: 'default',
  },
  // Focus shouldn't tint the label blue the way it does on the real questions.
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.text.secondary,
  },
  // The field still takes focus so the value can be copied, but it shouldn't look active.
  [`& .MuiOutlinedInput-notchedOutline,
    & .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline,
    & .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline`]: {
    borderColor: theme.palette.action.disabled,
    borderWidth: 1,
  },
}));

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  placeholder: string;
}

/** Greyed and locked so these on-record values don't read as questions the user is meant to answer. */
const ReadOnlyField: React.FC<ReadOnlyFieldProps> = (props) => (
  <GreyedTextField
    {...props}
    size="small"
    slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
  />
);

export const StaffInformation: React.FC = () => {
  const { t } = useTranslation();
  const { questionnaire, hasSpouse } = useNsoMpdQuestionnaire();
  const { data: userData } = useGetUserQuery();

  const [viewingSpouse, setViewingSpouse] = useState(false);

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
          // Backend doesn't currently support accessing the spouse's avatar
          avatarSrc: viewingSpouse ? null : userData?.user.avatar,
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
            <ReadOnlyField
              key={field.label}
              label={field.label}
              value={field.value}
              placeholder={t('Not on record')}
            />
          ))}
        </Stack>
      </StaffInfoCard>
    </Stack>
  );
};
