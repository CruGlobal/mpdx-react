import { useTranslation } from 'react-i18next';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { AccordianProps } from '../../accordianHelper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { MergeForm } from '../MergeForm/MergeForm';

export const MergeAccountsAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Merge Your Accounts');

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordianName}
      value={''}
    >
      <StyledFormLabel>{accordianName}</StyledFormLabel>
      <MergeForm isSpouse={false} />
    </AccordionItem>
  );
};
