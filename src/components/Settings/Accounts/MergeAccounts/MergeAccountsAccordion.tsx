import { useTranslation } from 'react-i18next';
import { AccountAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { AccordionProps } from '../../accordionHelper';
import { MergeForm } from '../MergeForm/MergeForm';

export const MergeAccountsAccordion: React.FC<
  AccordionProps<AccountAccordion>
> = ({ handleAccordionChange, expandedAccordion }) => {
  const { t } = useTranslation();
  const accordionName = t('Merge Your Accounts');

  return (
    <AccordionItem
      accordion={AccountAccordion.MergeAccounts}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={accordionName}
      value={''}
    >
      <StyledFormLabel>{accordionName}</StyledFormLabel>
      <MergeForm isSpouse={false} />
    </AccordionItem>
  );
};
