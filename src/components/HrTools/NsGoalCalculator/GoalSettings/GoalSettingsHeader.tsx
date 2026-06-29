import React, { useId, useMemo } from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import LocationOn from '@mui/icons-material/LocationOnOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import Phone from '@mui/icons-material/Phone';
import {
  Box,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { GoalSettingsPlaceholder } from './Fields/GoalSettingsPlaceholder';
import { GoalSettingsSelect, SelectOption } from './Fields/GoalSettingsSelect';
import { GoalSettingsPerson } from './goalSettingsFormValues';

interface ContactLineProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ContactLine: React.FC<ContactLineProps> = ({ icon, children }) => (
  <Stack direction="row" spacing={1} alignItems="flex-start">
    <Box
      sx={{
        color: 'text.secondary',
        display: 'flex',
        svg: { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  </Stack>
);

interface PersonInfoCardProps {
  person: GoalSettingsPerson;
}

const PersonInfoCard: React.FC<PersonInfoCardProps> = ({ person }) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle1" fontWeight="medium">
        {person.firstName} {person.lastName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('Person Number: {{number}}', { number: person.personNumber })}
      </Typography>
      <Stack spacing={0.75} sx={{ mt: 0.5 }}>
        <ContactLine icon={<MailOutline />}>{person.emailAddress}</ContactLine>
        <ContactLine icon={<Phone />}>{person.phoneNumber}</ContactLine>
        <ContactLine icon={<LocationOn />}>{person.address}</ContactLine>
      </Stack>
    </Stack>
  );
};

interface GoalSettingsHeaderProps {
  primaryPerson: GoalSettingsPerson;
  spousePerson: GoalSettingsPerson | null;
  mpdGoal: number;
  /**
   * Year the staff member joined staff. The calculation year options span from
   * this year up to the current year (newest first).
   */
  joinedStaffYear?: number | null;
}

export const GoalSettingsHeader: React.FC<GoalSettingsHeaderProps> = ({
  primaryPerson,
  spousePerson,
  mpdGoal,
  joinedStaffYear,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const yearLabelId = useId();

  // Years from joinedStaffYear to the current year, newest first. Falls back to
  // just the current year when joinedStaffYear is missing or in the future.
  const calculationsYearOptions = useMemo<SelectOption[]>(() => {
    const currentYear = DateTime.local().year;
    const startYear = Math.min(joinedStaffYear ?? currentYear, currentYear);
    return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
      const year = String(currentYear - index);
      return { value: year, label: year };
    });
  }, [joinedStaffYear]);

  const householdTitle = spousePerson
    ? `${primaryPerson.firstName} & ${spousePerson.firstName} ${primaryPerson.lastName}`
    : `${primaryPerson.firstName} ${primaryPerson.lastName}`;

  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mb: 1 }}
        flexWrap="wrap"
      >
        <Typography variant="h5">{householdTitle}</Typography>
        <Chip
          color="warning"
          variant="outlined"
          label={t('Incomplete')}
          size="small"
        />
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 3 }}
        flexWrap="wrap"
      >
        <Typography variant="body1" id={yearLabelId}>
          {t('Calculate using:')}
        </Typography>
        <Box sx={{ width: 120 }}>
          <GoalSettingsSelect
            name="calculationsYear"
            options={calculationsYearOptions}
            inputProps={{
              'aria-labelledby': yearLabelId,
            }}
          />
        </Box>
        <Tooltip
          title={t(
            'The year the goal is calculated for. This determines the salary and benefit constants used.',
          )}
        >
          <IconButton size="small" aria-label={t('About the calculation year')}>
            <InfoOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" sx={{ ml: 3 }}>
          {t('MPD Goal: {{amount}}', {
            amount: currencyFormat(mpdGoal, 'USD', locale, {
              showTrailingZeros: true,
            }),
          })}
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <PersonInfoCard person={primaryPerson} />
            </Grid>
            {spousePerson && (
              <Grid item xs={12} sm={6}>
                <PersonInfoCard person={spousePerson} />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* TODO(MPDX-9796): Attendee field */}
            <GoalSettingsPlaceholder
              label={t('Coach')}
              value={t('Amy Wilson')}
              showLabel
            />
            {/* TODO(MPDX-9796): Attendee field */}
            <GoalSettingsPlaceholder
              label={t('Coordinator')}
              value={t('Nancy Coleman')}
              showLabel
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
