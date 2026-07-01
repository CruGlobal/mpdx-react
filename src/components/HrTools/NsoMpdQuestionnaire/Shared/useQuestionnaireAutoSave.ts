import * as yup from 'yup';
import { useAutoSave } from 'src/components/Shared/Autosave/useAutosave';
import { NewStaffQuestionnaireAttributesInput } from 'src/graphql/types.generated';
import {
  NewStaffQuestionnaire,
  useNsoMpdQuestionnaire,
} from './NsoMpdQuestionnaireContext';

export type QuestionnaireField = keyof NewStaffQuestionnaireAttributesInput &
  keyof NonNullable<NewStaffQuestionnaire>;

interface UseQuestionnaireAutoSaveOptions {
  fieldName: QuestionnaireField;
  schema: yup.Schema;
  saveOnChange?: boolean;
}

/**
 * Bridges a single questionnaire field to the shared {@link useAutoSave} hook: seeds the value
 * from the loaded questionnaire and persists edits through the context's update mutation.
 */
export const useQuestionnaireAutoSave = ({
  fieldName,
  ...options
}: UseQuestionnaireAutoSaveOptions) => {
  const { questionnaire, saveField } = useNsoMpdQuestionnaire();

  return useAutoSave({
    value: questionnaire?.[fieldName],
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName,
    ...options,
  });
};
