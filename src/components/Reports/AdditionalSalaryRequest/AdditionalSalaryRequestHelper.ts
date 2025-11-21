export enum AdditionalSalaryRequestSectionEnum {
  AboutForm = 'about-form',
  CompleteForm = 'complete-form',
  Receipt = 'receipt',
}

export interface SectionOrderItem {
  title: string;
  section: AdditionalSalaryRequestSectionEnum;
}

// Translated titles should be used when rendering
export const sectionOrder: SectionOrderItem[] = [
  {
    title: 'About this Form',
    section: AdditionalSalaryRequestSectionEnum.AboutForm,
  },
  {
    title: 'Complete Form',
    section: AdditionalSalaryRequestSectionEnum.CompleteForm,
  },
  {
    title: 'Receipt',
    section: AdditionalSalaryRequestSectionEnum.Receipt,
  },
];
