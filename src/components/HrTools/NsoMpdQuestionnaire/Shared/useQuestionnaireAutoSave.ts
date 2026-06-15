import { useState } from 'react';
import * as yup from 'yup';
import { useAutoSave } from 'src/components/Shared/Autosave/useAutosave';

interface UseQuestionnaireAutoSaveOptions {
  fieldName: string;
  schema: yup.Schema;
  saveOnChange?: boolean;
}

/**
 * Bridges questionnaire fields to the shared {@link useAutoSave} hook until the questionnaire has a
 * backing API.
 */
export const useQuestionnaireAutoSave = ({
  fieldName,
  ...options
}: UseQuestionnaireAutoSaveOptions) => {
  const [questionnaire, setQuestionnaire] = useState<
    Record<string, string | null>
  >({});

  return useAutoSave({
    value: questionnaire[fieldName],
    saveValue: async (value) => {
      setQuestionnaire((prev) => ({ ...prev, [fieldName]: value }));
    },
    fieldName,
    ...options,
  });
};
