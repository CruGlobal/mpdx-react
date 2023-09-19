import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  FormControlLabel,
  MenuItem,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material';
import { SettingsWrapper } from './wrapper';
import { ProfileInfo } from '../../../../src/components/Settings/preferences/info/ProfileInfo';
import { PreferencesGroup } from '../../../../src/components/Settings/preferences/accordions/PreferencesGroup';
import { PreferencesItem } from '../../../../src/components/Settings/preferences/accordions/PreferencesItem';
import { PersPrefFormWrapper } from '../../../../src/components/Settings/preferences/forms/PreferencesFormWrapper';
import {
  PersPrefFieldWrapper,
  StyledOutlinedInput,
  StyledSelect,
} from '../../../../src/components/Settings/preferences/shared/PreferencesForms';
import {
  language,
  options,
  localeOptions,
} from '../../../../src/components/Settings/preferences/DemoContent';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { MobileDatePicker } from '@mui/x-date-pickers';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';
import { suggestArticles } from 'src/lib/helpScout';

import { useLocale } from 'src/hooks/useLocale';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';

const Preferences: React.FC = () => {
  const { t } = useTranslation();
  const [expandedPanel, setExpandedPanel] = useState('');
  const locale = useLocale();
  const accountListId = useAccountListId() ?? '';

  useEffect(() => {
    suggestArticles('HS_SETTINGS_PREFERENCES_SUGGESTIONS');
  }, []);

  const handleAccordionChange = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? '' : panel);
  };

  const handleSubmit = () => {
    // eslint-disable-next-line no-console
    console.log('handleSubmithandleSubmit');
  };

  return (
    <SettingsWrapper
      pageTitle={t('Preferences')}
      pageHeading={t('Preferences')}
      selectedMenuId="preferences"
    >
      <ProfileInfo accountListId={accountListId} />

      <PreferencesGroup title={t('Personal Preferences')}>
        {/* Language */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Language')}
          value={t('US English')}
        >
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={true}
            isSubmitting={false}
          >
            <FieldWrapper
              labelText={t('Language')}
              helperText={t(
                'The language determines your default language for MPDX.',
              )}
            >
              <StyledSelect value="en-US">
                {language.map(([languageCode, languageName], index) => (
                  <MenuItem value={languageCode} key={index}>
                    {t(languageName)}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FieldWrapper>
          </FormWrapper>
        </PreferencesItem>

        {/* Locale */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Locale')}
          value={t('English')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
              labelText={t('Locale')}
              helperText={t(
                'The locale determines how numbers, dates and other information are formatted in MPDX.',
              )}
            >
              <StyledSelect value="en">
                {localeOptions.map(([localeCode, localeName], index) => (
                  <MenuItem value={localeCode} key={index}>
                    {t(localeName)}
                  </MenuItem>
                ))}
              </StyledSelect>
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>

        {/* Default Account */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Default Account')}
          value={t('Test account')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
              labelText={t('Default Account List')}
              helperText={t(
                'This sets which account you will land in whenever you login to MPDX.',
              )}
            >
              <StyledSelect value="opt1">
                {options.map(([optionVal, optionLabel], index) => (
                  <MenuItem value={optionVal} key={index}>
                    {t(optionLabel)}
                  </MenuItem>
                ))}
              </StyledSelect>
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>

        {/* Timezone */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Timezone')}
          value={t('Central America')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
              labelText={t('Timezone')}
              helperText={t(
                'The timezone will be used in setting tasks, appointments, completion dates, etc. Please make sure it matches the one your computer is set to.',
              )}
            >
              <StyledSelect value="opt1">
                {options.map(([optionVal, optionLabel], index) => (
                  <MenuItem value={optionVal} key={index}>
                    {t(optionLabel)}
                  </MenuItem>
                ))}
              </StyledSelect>
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>

        {/* Time to Send Notifications */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Time to Send Notifications')}
          value={t('Immediately')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
              labelText={t('Time To Send Notifications')}
              helperText={t(
                'MPDX can send you app notifications immediately or at a particular time each day. Please make sure your time zone is set correctly so this time matches your local time.',
              )}
            >
              <StyledSelect value="opt1">
                {options.map(([optionVal, optionLabel], index) => (
                  <MenuItem value={optionVal} key={index}>
                    {t(optionLabel)}
                  </MenuItem>
                ))}
              </StyledSelect>
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>
      </PreferencesGroup>

      <PreferencesGroup title={t('Account Preferences')}>
        {/* Account Name */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Account Name')}
          value={t('Test account')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
              labelText={t('Account Name')}
              helperText={t(
                'You can change the account name in MPDX into something that is more identifiable to you. This will not change the account name with your organization.',
              )}
            >
              <StyledOutlinedInput />
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>

        {/* Monthly Goal */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Monthly Goal')}
          value={t('10,000.00')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
              labelText={t('Monthly Goal')}
              helperText={t(
                'This amount should be set to the amount your organization has determined is your target monthly goal. If you do not know, make your best guess for now. You can change it at any time.',
              )}
            >
              <StyledOutlinedInput />
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>

        {/* Home Country */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Home Country')}
          value={t('United States of America')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
              labelText={t('Home Country')}
              helperText={t(
                'This should be the place from which you are living and sending out physical communications. This will be used in exports for mailing address information.',
              )}
            >
              <StyledSelect value="opt1">
                {options.map(([optionVal, optionLabel], index) => (
                  <MenuItem value={optionVal} key={index}>
                    {t(optionLabel)}
                  </MenuItem>
                ))}
              </StyledSelect>
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>

        {/* Default Currency */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Default Currency')}
          value={t('USD')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper labelText={t('Default Currency')}>
              <StyledSelect value="opt1">
                {options.map(([optionVal, optionLabel], index) => (
                  <MenuItem value={optionVal} key={index}>
                    {t(optionLabel)}
                  </MenuItem>
                ))}
              </StyledSelect>
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>

        {/* Early Adopter */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Early Adopter')}
          value={t('No')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
              helperText={t(
                "By checking this box, you are telling us that you'd like to test new features for bugs before they are rolled out to the full MPDX user base. We'll send you an email when new features are available on your account to test, and then ask for you to give us feedback - both if you experience bugs and also about your thoughts about the feature(s) you are testing.",
              )}
              helperPosition="bottom"
            >
              <FormControlLabel
                control={<Checkbox value="earlyAdopter" />}
                label={t('Early Adopter')}
              />
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>

        {/* MPD Info */}
        <PreferencesItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('MPD Info')}
          value=""
        >
          <PersPrefFormWrapper>
            {/* <StyledColumnsWrapper> */}
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6} spacing={3}>
                <PersPrefFieldWrapper labelText={t('Start Date')}>
                  <MobileDatePicker
                    renderInput={(params) => (
                      <TextField
                        fullWidth
                        inputProps={{ 'aria-label': t('Start Date') }}
                        {...params}
                      />
                    )}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          aria-label="change start date"
                          position="end"
                        >
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    }}
                    onChange={(): void => undefined}
                    value={null}
                    inputFormat={getDateFormatPattern(locale)}
                    label={t('Start Date')}
                  />
                </PersPrefFieldWrapper>
              </Grid>
              <Grid item xs={6} spacing={3}>
                <PersPrefFieldWrapper labelText={t('End Date')}>
                  <MobileDatePicker
                    renderInput={(params) => (
                      <TextField
                        fullWidth
                        inputProps={{ 'aria-label': t('End Date') }}
                        {...params}
                      />
                    )}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          aria-label="change end date"
                          position="end"
                        >
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    }}
                    onChange={(): void => undefined}
                    value={null}
                    inputFormat={getDateFormatPattern(locale)}
                    label={t('End Date')}
                  />
                </PersPrefFieldWrapper>
              </Grid>
            </Grid>
            {/* </StyledColumnsWrapper> */}
            <PersPrefFieldWrapper
              labelText={t('New Recurring Commitment Goal')}
              helperText={t(
                'This should be set to the amount of new recurring commitments you expect to raise during the period set above. If you do not know, make your best guess for now. You can change it at any time.',
              )}
            >
              <StyledOutlinedInput />
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PreferencesItem>
      </PreferencesGroup>
    </SettingsWrapper>
  );
};

export default Preferences;
