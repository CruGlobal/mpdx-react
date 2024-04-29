import { ActivityTypeEnum, PhaseEnum } from 'src/graphql/types.generated';

type SetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined,
) => void;

export type HandleTaskPhaseChangeProps = {
  phase: PhaseEnum | null;
  setFieldValue: SetFieldValue;
};

export type HandleTaskActionChangeProps = {
  activityType: ActivityTypeEnum | null;
  setFieldValue: SetFieldValue;
};
