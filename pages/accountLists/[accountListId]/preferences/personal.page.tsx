import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  styled,
  useTheme,
} from '@material-ui/core';
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
  '& .MuiFormControl-root': {
    width: `calc(50% - ${theme.spacing(1)}px)`,
    '&:nth-child(2n)': {
      marginLeft: theme.spacing(2),
    },
  },
}));

const PersonalPreferences: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expandedPanel, setExpandedPanel] = useState('');

  const handleAccordionChange = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? '' : panel);
  };

  return (
    <PreferencesWrapper
      pageTitle="Personal Preferences"
      pageHeading="Preferences"
    >
      <Box component="section">
        <PersPrefInfo />
      </Box>
      <Box component="section" marginTop={3}>
        <PersPrefGroup title="Personal Preferences">
          {/* Language */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Language"
            value="US English"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper
                labelText="Language"
                helperText="The language determines your default language for MPDX."
              >
                <StyledSelect value="en-US">
                  {language.map((current, index) => (
                    <MenuItem value={current[0]} key={index}>
                      {t(current[1])}
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
            label="Locale"
            value="English"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper
                labelText="Locale"
                helperText="The locale determines how numbers, dates and other information are formatted in MPDX."
              >
                <StyledSelect value="en">
                  {locale.map((current, index) => (
                    <MenuItem value={current[0]} key={index}>
                      {t(current[1])}
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
            label="Default Account"
            value="Test account"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper
                labelText="Default Account List"
                helperText="This sets which account you will land in whenever you login to MPDX."
              >
                <StyledSelect value="opt1">
                  {options.map((current, index) => (
                    <MenuItem value={current[0]} key={index}>
                      {t(current[1])}
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
            label="Timezone"
            value="Central America"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper
                labelText="Timezone"
                helperText="The timezone will be used in setting tasks, appointments, completion dates, etc. Please make sure it matches the one your computer is set to."
              >
                <StyledSelect value="opt1">
                  {options.map((current, index) => (
                    <MenuItem value={current[0]} key={index}>
                      {t(current[1])}
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
            label="Time to Send Notifications"
            value="Immediately"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper
                labelText="Time To Send Notifications"
                helperText="MPDX can send you app notifications immediately or at a particular time each day. Please make sure your time zone is set correctly so this time matches your local time."
              >
                <StyledSelect value="opt1">
                  {options.map((current, index) => (
                    <MenuItem value={current[0]} key={index}>
                      {t(current[1])}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </PersPrefFieldWrapper>
            </PersPrefFormWrapper>
          </PersPrefItem>
        </PersPrefGroup>

        <PersPrefGroup title="Account Preferences">
          {/* Account Name */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Account Name"
            value="Test account"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper
                labelText="Account Name"
                helperText="You can change the account name in MPDX into something that is more identifiable to you. This will not change the account name with your organization."
              >
                <StyledOutlinedInput />
              </PersPrefFieldWrapper>
            </PersPrefFormWrapper>
          </PersPrefItem>

          {/* Monthly Goal */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Monthly Goal"
            value="10,000.00"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper
                labelText="Monthly Goal"
                helperText="This amount should be set to the amount your organization has determined is your target monthly goal. If you do not know, make your best guess for now. You can change it at any time."
              >
                <StyledOutlinedInput />
              </PersPrefFieldWrapper>
            </PersPrefFormWrapper>
          </PersPrefItem>

          {/* Home Country */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Home Country"
            value="United States of America"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper
                labelText="Home Country"
                helperText="This should be the place from which you are living and sending out physical communications. This will be used in exports for mailing address information."
              >
                <StyledSelect value="opt1">
                  {options.map((current, index) => (
                    <MenuItem value={current[0]} key={index}>
                      {t(current[1])}
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
            label="Default Currency"
            value="USD"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper labelText="Default Currency">
                <StyledSelect value="opt1">
                  {options.map((current, index) => (
                    <MenuItem value={current[0]} key={index}>
                      {t(current[1])}
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
            label="Early Adopter"
            value="No"
          >
            <PersPrefFormWrapper>
              <PersPrefFieldWrapper
                helperText="By checking this box, you are telling us that you'd like to test new
        features for bugs before they are rolled out to the full MPDX user base.
        We'll send you an email when new features are available on your account
        to test, and then ask for you to give us feedback - both if you
        experience bugs and also about your thoughts about the feature(s) you
        are testing."
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
            label="MPD Info"
            value=""
          >
            <PersPrefFormWrapper>
              <StyledColumnsWrapper style={{ marginBottom: theme.spacing(2) }}>
                <PersPrefFieldWrapper labelText="Start Date">
                  <StyledOutlinedInput />
                </PersPrefFieldWrapper>
                <PersPrefFieldWrapper labelText="End Date">
                  <StyledOutlinedInput />
                </PersPrefFieldWrapper>
              </StyledColumnsWrapper>
              <PersPrefFieldWrapper
                labelText="New Recurring Commitment Goal"
                helperText="This should be set to the amount of new recurring commitments you
          expect to raise during the period set above. If you do not know, make
          your best guess for now. You can change it at any time."
              >
                <StyledOutlinedInput />
              </PersPrefFieldWrapper>
            </PersPrefFormWrapper>
          </PersPrefItem>
        </PersPrefGroup>
      </Box>
    </PreferencesWrapper>
  );
};

export default PersonalPreferences;
