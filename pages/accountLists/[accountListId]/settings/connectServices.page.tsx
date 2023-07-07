import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsWrapper } from './wrapper';
import { suggestArticles } from 'src/lib/helpScout';

import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { StyledOutlinedInput } from 'src/components/Shared/Forms/Field';

const ConnectServices: React.FC = () => {
  const { t } = useTranslation();
  const [expandedPanel, setExpandedPanel] = useState('');
  // const [isValid, setIsValid] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    suggestArticles('HS_SETTINGS_SERVICES_SUGGESTIONS');
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
      pageTitle={t('Connect Services')}
      pageHeading={t('Connect Services')}
    >
      <AccordionGroup title={t('Account Preferences')}>
        <AccordionItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('The Key / Relay')}
          value={''}
          image={
            <img
              src="https://mpdx.org/f9a1f0e0afe640e0f704099d96503be5.png"
              alt="The Key"
            />
          }
        >
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={true}
            isSubmitting={false}
          >
            <FieldWrapper labelText={t('Email Address')} helperText={''}>
              <StyledOutlinedInput />
            </FieldWrapper>
          </FormWrapper>
        </AccordionItem>
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export default ConnectServices;
