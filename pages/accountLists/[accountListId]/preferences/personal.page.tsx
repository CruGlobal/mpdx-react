import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { PreferencesWrapper } from './wrapper';
import { PersPrefInfo } from './personal/info/PersPrefInfo';
import { PersPrefGroup } from './personal/accordions/PersPrefGroup';
import { PersPrefItem } from './personal/accordions/PersPrefItem';

const PersonalPreferences: React.FC = () => {
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
            Content
          </PersPrefItem>

          {/* Locale */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Locale"
            value="English"
          >
            Content
          </PersPrefItem>

          {/* Default Account */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Default Account"
            value="Test account"
          >
            Content
          </PersPrefItem>

          {/* Timezone */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Timezone"
            value="Central America"
          >
            Content
          </PersPrefItem>

          {/* Time to Send Notifications */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Time to Send Notifications"
            value="Immediately"
          >
            Content
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
            Content
          </PersPrefItem>

          {/* Monthly Goal */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Monthly Goal"
            value="10,000.00"
          >
            Content
          </PersPrefItem>

          {/* Home Country */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Home Country"
            value="United States of America"
          >
            Content
          </PersPrefItem>

          {/* Default Currency */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Default Currency"
            value="USD"
          >
            Content
          </PersPrefItem>

          {/* Early Adopter */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Early Adopter"
            value="No"
          >
            Content
          </PersPrefItem>

          {/* MPD Info */}
          <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="MPD Info"
            value=""
          >
            Content
          </PersPrefItem>
        </PersPrefGroup>
      </Box>
    </PreferencesWrapper>
  );
};

export default PersonalPreferences;
