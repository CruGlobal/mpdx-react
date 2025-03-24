import {
  ContactFilterSetInput,
  ReportContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';

type ContactFilterKey = keyof ContactFilterSetInput;
type ContactFilterValue = ContactFilterSetInput[ContactFilterKey];
type ReportContactFilterKey = keyof ReportContactFilterSetInput;
type ReportContactFilterValue =
  ReportContactFilterSetInput[ReportContactFilterKey];
type TaskFilterKey = keyof TaskFilterSetInput;
type TaskFilterValue = TaskFilterSetInput[TaskFilterKey];
export type FilterKey =
  | ContactFilterKey
  | TaskFilterKey
  | ReportContactFilterKey;
export type FilterValue =
  | ContactFilterValue
  | TaskFilterValue
  | ReportContactFilterValue;
