import {
  ContactFilterSetInput,
  PartnerGivingAnalysisFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';

type ContactFilterKey = keyof ContactFilterSetInput;
type ContactFilterValue = ContactFilterSetInput[ContactFilterKey];
type PartnerGivingAnalysisFilterKey = keyof PartnerGivingAnalysisFilterSetInput;
type PartnerGivingAnalysisFilterValue =
  PartnerGivingAnalysisFilterSetInput[PartnerGivingAnalysisFilterKey];
type TaskFilterKey = keyof TaskFilterSetInput;
type TaskFilterValue = TaskFilterSetInput[TaskFilterKey];
export type FilterKey =
  | ContactFilterKey
  | TaskFilterKey
  | PartnerGivingAnalysisFilterKey;
export type FilterValue =
  | ContactFilterValue
  | TaskFilterValue
  | PartnerGivingAnalysisFilterValue;
