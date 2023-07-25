import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { StyledOutlinedInput } from 'src/components/Shared/Forms/Field';

interface TheKeyAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
}

export const TheKeyAccordian: React.FC<TheKeyAccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();

  const handleSubmit = () => {
    return;
  };

  return (
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
      <FormWrapper onSubmit={handleSubmit} isValid={true} isSubmitting={false}>
        <FieldWrapper labelText={t('Email Address')} helperText={''}>
          <StyledOutlinedInput />
        </FieldWrapper>
      </FormWrapper>
    </AccordionItem>
  );
};
