export enum AdditionalSalaryRequestSectionEnum {
  AboutForm = 'about-form',
  CompleteForm = 'complete-form',
  Receipt = 'receipt',
}

export interface SectionOrderItem {
  title: string;
  section: AdditionalSalaryRequestSectionEnum;
}
