import React from 'react';
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { PhoneNumberField } from './PhoneNumberField';

export const ContactInformation: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { questionnaire } = useNsoMpdQuestionnaire();
  const { maritalStatus, firstName, spouseFirstName } = questionnaire ?? {};

  const hasSpouse =
    !!maritalStatus &&
    maritalStatus !== NewStaffQuestionnaireMaritalStatusEnum.Single;

  const userName = firstName ?? t('You');
  const spouseColumnName = spouseFirstName ?? t('Spouse');
  const spouseName = spouseFirstName ?? t('your spouse');

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t('Contact Information')}</Typography>
      <Typography>
        {hasSpouse
          ? t('Please provide a cell phone number for each person below.')
          : t('Please provide your cell phone number.')}
      </Typography>
      <Table size="small" sx={{ maxWidth: theme.spacing(90) }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: theme.spacing(25) }} />
            <TableCell scope="col" sx={{ color: theme.palette.mpdxBlue.main }}>
              {userName}
            </TableCell>
            {hasSpouse && (
              <TableCell
                scope="col"
                sx={{ color: theme.palette.mpdxBlue.main }}
              >
                {spouseColumnName}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
              {t('Cell Phone Number')}
            </TableCell>
            <TableCell>
              <PhoneNumberField
                fieldName="phoneNumber"
                ariaLabel={t('Your Cell Phone Number')}
              />
            </TableCell>
            {hasSpouse && (
              <TableCell>
                <PhoneNumberField
                  fieldName="spousePhoneNumber"
                  ariaLabel={t("{{spouseName}}'s Cell Phone Number", {
                    spouseName,
                  })}
                />
              </TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  );
};
