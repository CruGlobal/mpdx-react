import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';

/** What the form registers so the sidebar can guard its own back link. */
interface RegisteredForm {
  dirty: boolean;
  /** Throws the unsaved edits away without leaving the page. */
  discard: () => void;
}

interface GoalSettingsNavigationContextValue {
  /** Where the back link points, or null when there is nowhere to go back to. */
  returnUrl: string | null;
  /** Label for the back link, or null when this view has nowhere to go back to. */
  returnLabel: string | null;
  /** Goes back, confirming first when the form has unsaved edits. */
  leave: () => void;
  /**
   * Goes back with no confirmation, for use after a successful save. With
   * nowhere to go back to it just clears the unsaved edits.
   */
  returnToTable: () => void;
  registerForm: (form: RegisteredForm) => void;
}

const noop = () => undefined;

const GoalSettingsNavigationContext =
  createContext<GoalSettingsNavigationContextValue>({
    returnUrl: null,
    returnLabel: null,
    leave: noop,
    returnToTable: noop,
    registerForm: noop,
  });

export const useGoalSettingsNavigation =
  (): GoalSettingsNavigationContextValue =>
    useContext(GoalSettingsNavigationContext);

interface GoalSettingsNavigationProviderProps {
  /** Where Back to Table, Cancel, and a successful save return to. */
  returnUrl?: string;
  returnLabel?: string;
  children: React.ReactNode;
}

/**
 * Owns everything that leaves Goal Settings: the back destination and the
 * unsaved-changes confirmation. The sidebar's back link sits outside the
 * Formik tree, so the form registers its dirty state here rather than each
 * exit growing its own guard.
 */
export const GoalSettingsNavigationProvider: React.FC<
  GoalSettingsNavigationProviderProps
> = ({ returnUrl, returnLabel, children }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  // A ref, not state: only read when an exit is clicked, and re-rendering the
  // whole form on every keystroke's dirty change would be wasteful.
  const formRef = useRef<RegisteredForm>({ dirty: false, discard: noop });

  const registerForm = useCallback((form: RegisteredForm) => {
    formRef.current = form;
  }, []);

  const returnToTable = useCallback(() => {
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      // Nowhere to go back to, so the best a discard can do is undo the edits.
      formRef.current.discard();
    }
  }, [returnUrl, router]);

  const leave = useCallback(() => {
    if (formRef.current.dirty) {
      setConfirming(true);
    } else {
      returnToTable();
    }
  }, [returnToTable]);

  return (
    <GoalSettingsNavigationContext.Provider
      value={{
        returnUrl: returnUrl ?? null,
        returnLabel: returnUrl ? (returnLabel ?? t('Back to Table')) : null,
        leave,
        returnToTable,
        registerForm,
      }}
    >
      {children}
      <Confirmation
        isOpen={confirming}
        title={t('Unsaved Changes')}
        message={t(
          'You have unsaved changes. Are you sure you want to cancel? Your changes will not be saved.',
        )}
        confirmLabel={t('Discard Changes')}
        cancelLabel={t('Keep Editing')}
        mutation={async () => returnToTable()}
        handleClose={() => setConfirming(false)}
      />
    </GoalSettingsNavigationContext.Provider>
  );
};
