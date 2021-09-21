import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from '@material-ui/core';
import { PreferencesWrapper } from './wrapper';
import { PersPrefInfo } from './personal/info/PersPrefInfo';
import { PersPrefGroup } from './personal/accordions/PersPrefGroup';
import { PersPrefItem2 } from './personal/accordions/PersPrefItem';

const PersonalPreferences: React.FC = () => {
  // const [expandedPanel, setExpandedPanel] = useState('');

  // const handleAccordionChange = (panel: string) => (
  //   event: React.ChangeEvent<{}>,
  // ) => {
  //   setExpandedPanel(expandedPanel === panel ? '' : panel);
  // };
  const [expanded, setExpanded] = useState('');

  const handleChange = (panel: string) => (
    event: React.ChangeEvent<Record<string, unknown>>,
    isExpanded: boolean,
  ) => {
    console.log('handleChange triggered!');
    setExpanded(isExpanded ? panel : '');
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
          <PersPrefItem2
            onAccordionChange={handleChange}
            expandedPanel={expanded}
            label="Summary/Label"
            value="Details/Value"
          >
            Hello world!
          </PersPrefItem2>
          <Box marginTop={2}>
            <Accordion
              expanded={expanded === 'panel1'}
              onChange={handleChange('panel1')}
            >
              <AccordionSummary>Panel 1</AccordionSummary>
              <AccordionDetails>Details</AccordionDetails>
            </Accordion>
          </Box>
          <Box marginTop={2}>
            <Accordion
              expanded={expanded === 'panel2'}
              onChange={handleChange('panel2')}
            >
              <AccordionSummary>Panel 2</AccordionSummary>
              <AccordionDetails>Details</AccordionDetails>
            </Accordion>
          </Box>
          {/* <PersPrefItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label="Language"
            value="US English"
          >
            Hello
          </PersPrefItem> */}
        </PersPrefGroup>
        <PersPrefGroup title="Account Preferences">Hello</PersPrefGroup>
      </Box>
    </PreferencesWrapper>
  );
};

export default PersonalPreferences;
