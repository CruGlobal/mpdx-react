import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface AutosaveFormContextType {
  /** Mark a field as valid */
  markValid: (fieldName: string) => void;

  /** Mark a field as invalid */
  markInvalid: (fieldName: string) => void;

  /** Whether all fields are valid */
  allValid: boolean;
}

const AutosaveFormContext = createContext<AutosaveFormContextType | null>(null);

export const useOptionalAutosaveForm = (): AutosaveFormContextType | null =>
  useContext(AutosaveFormContext);

export const useAutosaveForm = (): AutosaveFormContextType => {
  const context = useOptionalAutosaveForm();
  if (!context) {
    throw new Error('useAutosaveForm must be used within an AutosaveForm');
  }
  return context;
};

interface AutosaveFormProps {
  children?: React.ReactNode;
}

/**
 * <AutosaveForm> helps pages containing autosaving fields (any component that uses the
 * `useAutosave` hook) track which fields are invalid. To use, wrap the autosaving fields in
 * <AutosaveForm> and `useAutosave` will automatically call `markValid` and `markInvalid`. Then
 * anywhere inside of the <AutosaveForm> call `useAutosaveForm().allValid` to know whether any
 * fields are invalid.
 *
 * allValid starts as false until at least one field registers its status, preventing a brief
 * flash of enabled submit/continue buttons before fields validate.
 */
export const AutosaveForm: React.FC<AutosaveFormProps> = ({ children }) => {
  // Track the list of fields that are currently invalid
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  // Track whether any field has reported its status yet
  const [hasRegisteredFields, setHasRegisteredFields] = useState(false);

  // Mark a field as valid
  const markValid = useCallback((fieldName: string) => {
    setHasRegisteredFields(true);
    setInvalidFields((prev) => prev.filter((field) => field !== fieldName));
  }, []);

  // Mark a field as invalid
  const markInvalid = useCallback((fieldName: string) => {
    setHasRegisteredFields(true);
    setInvalidFields((prev) =>
      prev.includes(fieldName) ? prev : [...prev, fieldName],
    );
  }, []);

  const allValid = hasRegisteredFields ? invalidFields.length === 0 : false;

  const contextValue: AutosaveFormContextType = useMemo(
    () => ({
      markValid,
      markInvalid,
      allValid,
    }),
    [markValid, markInvalid, allValid],
  );

  return (
    <AutosaveFormContext.Provider value={contextValue}>
      {children}
    </AutosaveFormContext.Provider>
  );
};
