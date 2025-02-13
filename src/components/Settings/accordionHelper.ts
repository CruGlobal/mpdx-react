export interface AccordionProps<AccordionEnum> {
  handleAccordionChange: (accordion: AccordionEnum | null) => void;
  expandedAccordion: AccordionEnum | null;
}
