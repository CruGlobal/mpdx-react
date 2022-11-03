import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PreferencesWrapper } from './wrapper';
import { PersPrefInfo } from './personal/info/PersPrefInfo';
import { PersPrefGroup } from './personal/accordions/PersPrefGroup';
import { PersPrefItem } from './personal/accordions/PersPrefItem';
import {
  PersPrefFieldWrapper,
  PersPrefFormWrapper,
  StyledOutlinedInput,
  StyledSelect,
} from './personal/shared/PersPrefForms';
import { language, locale, options } from './personal/DemoContent';

const StyledColumnsWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiFormControl-root': {
    width: `calc(50% - ${theme.spacing(1)}px)`,
    '&:nth-child(2n)': {
      marginLeft: theme.spacing(2),
    },
  },
}));

const PersonalPreferences: React.FC = () => {
  const { t } = useTranslation();
  const [expandedPanel, setExpandedPanel] = useState('');

  const handleAccordionChange = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? '' : panel);
  };

  return (
    <PreferencesWrapper
      pageTitle={t('Personal Preferences')}
      pageHeading={t('Preferences')}
    >
      <PersPrefInfo />

      <PersPrefGroup title={t('Personal Preferences')}>
        {/* Language */}
        <PersPrefItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Language')}
          value={t('US English')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
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
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PersPrefItem>

        {/* Locale */}
        <PersPrefItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Locale')}
          value={t('English')}
        >
          <PersPrefFormWrapper>
            <PersPrefFieldWrapper
              labelText={t('Locale')}
              helperText={t(
                'The locale determines how numbers, dates and other information areformatted in MPDX.',
              )}
            >
              <StyledSelect value="en">
                {locale.map(([localeCode, localeName], index) => (
                  <MenuItem value={localeCode} key={index}>
                    {t(localeName)}
                  </MenuItem>
                ))}
              </StyledSelect>
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PersPrefItem>

        {/* Default Account */}
        <PersPrefItem
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
        </PersPrefItem>

        {/* Timezone */}
        <PersPrefItem
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
        </PersPrefItem>

        {/* Time to Send Notifications */}
        <PersPrefItem
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
        </PersPrefItem>
      </PersPrefGroup>

      <PersPrefGroup title={t('Account Preferences')}>
        {/* Account Name */}
        <PersPrefItem
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
        </PersPrefItem>

        {/* Monthly Goal */}
        <PersPrefItem
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
        </PersPrefItem>

        {/* Home Country */}
        <PersPrefItem
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
        </PersPrefItem>

        {/* Default Currency */}
        <PersPrefItem
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
        </PersPrefItem>

        {/* Early Adopter */}
        <PersPrefItem
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
        </PersPrefItem>

        {/* MPD Info */}
        <PersPrefItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('MPD Info')}
          value=""
        >
          <PersPrefFormWrapper>
            <StyledColumnsWrapper>
              <PersPrefFieldWrapper labelText={t('Start Date')}>
                <StyledOutlinedInput />
              </PersPrefFieldWrapper>
              <PersPrefFieldWrapper labelText={t('End Date')}>
                <StyledOutlinedInput />
              </PersPrefFieldWrapper>
            </StyledColumnsWrapper>
            <PersPrefFieldWrapper
              labelText={t('New Recurring Commitment Goal')}
              helperText={t(
                'This should be set to the amount of new recurring commitments you expect to raise during the period set above. If you do not know, make your best guess for now. You can change it at any time.',
              )}
            >
              <StyledOutlinedInput />
            </PersPrefFieldWrapper>
          </PersPrefFormWrapper>
        </PersPrefItem>
      </PersPrefGroup>
    </PreferencesWrapper>
  );
};

export default PersonalPreferences;
